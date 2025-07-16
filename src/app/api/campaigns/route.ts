import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database";
import { createClient } from "@/lib/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const businessId = searchParams.get("businessId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("campaigns")
      .select(
        `
        *,
        business:profiles!business_id(*),
        applications!campaign_id(count)
      `
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (businessId) {
      query = query.eq("business_id", businessId);
    } else {
      // If no businessId specified, only show active campaigns for public view
      query = query.eq("status", "active");
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error("Error fetching campaigns:", error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 403 }
    );
  }

  if (profile.user_role !== "business") {
    return NextResponse.json(
      { error: "Only business users can create campaigns" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    title,
    description,
    requirements,
    budget_min,
    budget_max,
    deliverables,
    target_audience,
    campaign_goals,
    platforms,
    guidelines,
    start_date,
    end_date,
    application_deadline,
    tags,
    images,
    required_influencers,
  } = body;

  const start = new Date(start_date);
  const end = new Date(end_date);
  const deadline = application_deadline ? new Date(application_deadline) : null;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (start > end) {
    return NextResponse.json(
      { error: "Start date must be before end date" },
      { status: 400 }
    );
  }

  if (deadline && deadline > start) {
    return NextResponse.json(
      { error: "Application deadline must be before the start date" },
      { status: 400 }
    );
  }

  const { data: campaign, error: insertError } = await supabase
    .from("campaigns")
    .insert({
      business_id: userId,
      title,
      description,
      requirements,
      budget_min,
      budget_max,
      deliverables,
      target_audience,
      campaign_goals,
      platforms,
      guidelines,
      start_date,
      end_date,
      application_deadline: deadline,
      tags,
      images,
      required_influencers: required_influencers || 1,
      status: "active",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating campaign:", insertError);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }

  return NextResponse.json({ campaign }, { status: 201 });
}
