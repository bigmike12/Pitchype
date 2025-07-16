"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  FileText,
  ExternalLink,
  Image,
  Video,
  Link,
  File,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaItemCard from "./MediaItemCard";
import { useSubmissionActions } from "@/hooks/useSubmissionActions";

interface SubmitWorkProps {
  applicationId: string;
  campaignTitle?: string;
  onSubmissionSuccess?: () => void;
  className?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  description: string;
  title?: string;
  thumbnail_url?: string;
  alt_text?: string;
  filename?: string;
  type?: string;
  platform?: string;
}

export default function SubmitWork({
  applicationId,
  campaignTitle,
  onSubmissionSuccess,
  className,
}: SubmitWorkProps) {
  const { submitWork, isSubmitting } = useSubmissionActions();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [links, setLinks] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);

  const addMediaItem = (type: "images" | "videos" | "links" | "documents") => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      url: "",
      description: "",
    };

    switch (type) {
      case "images":
        setImages((prev) => [...prev, newItem]);
        break;
      case "videos":
        setVideos((prev) => [...prev, newItem]);
        break;
      case "links":
        setLinks((prev) => [...prev, newItem]);
        break;
      case "documents":
        setDocuments((prev) => [...prev, newItem]);
        break;
    }
  };

  const updateMediaItem = (
    type: "images" | "videos" | "links" | "documents",
    id: string,
    field: keyof MediaItem,
    value: string
  ) => {
    const updateFunction = (prev: MediaItem[]) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item));

    switch (type) {
      case "images":
        setImages(updateFunction);
        break;
      case "videos":
        setVideos(updateFunction);
        break;
      case "links":
        setLinks(updateFunction);
        break;
      case "documents":
        setDocuments(updateFunction);
        break;
    }
  };

  const removeMediaItem = (
    type: "images" | "videos" | "links" | "documents",
    id: string
  ) => {
    const filterFunction = (prev: MediaItem[]) =>
      prev.filter((item) => item.id !== id);

    switch (type) {
      case "images":
        setImages(filterFunction);
        break;
      case "videos":
        setVideos(filterFunction);
        break;
      case "links":
        setLinks(filterFunction);
        break;
      case "documents":
        setDocuments(filterFunction);
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!title.trim() && !description.trim() && !notes.trim()) {
        throw new Error(
          "Please provide at least a title, description, or notes for your submission"
        );
      }

      // Filter out empty media items
      const validImages = images.filter((item) => item.url.trim());
      const validVideos = videos.filter((item) => item.url.trim());
      const validLinks = links.filter((item) => item.url.trim());
      const validDocuments = documents.filter((item) => item.url.trim());

      // Pass the data in the correct format for your API
      await submitWork({
        campaignId: applicationId,
        title: title.trim(),
        description: description.trim(),
        notes: notes.trim(),
        images: validImages,
        videos: validVideos,
        links: validLinks,
        documents: validDocuments,
      });

      setSuccess(
        "Work submitted successfully! The business will review your submission."
      );
      resetForm();

      // Call success callback after a short delay
      setTimeout(() => {
        setSuccess(null);
        onSubmissionSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit work");
    }
  };
  //   try {
  //     setError(null);
  //     setSuccess(null);

  //     if (!title.trim() && !description.trim() && !notes.trim()) {
  //       throw new Error(
  //         "Please provide at least a title, description, or notes for your submission"
  //       );
  //     }

  //     // Filter out empty media items
  //     const validImages = images.filter((item) => item.url.trim());
  //     const validVideos = videos.filter((item) => item.url.trim());
  //     const validLinks = links.filter((item) => item.url.trim());
  //     const validDocuments = documents.filter((item) => item.url.trim());

  //     await submitWork({
  //       campaignId: applicationId,
  //       content:
  //         `${title.trim() || ""} ${description.trim() || ""} ${notes.trim() || ""}`.trim(),
  //       deliverables: [
  //         ...validImages.map((img) => img.url),
  //         ...validVideos.map((vid) => vid.url),
  //         ...validLinks.map((link) => link.url),
  //         ...validDocuments.map((doc) => doc.url),
  //       ],
  //     });

  //     setSuccess(
  //       "Work submitted successfully! The business will review your submission."
  //     );
  //     resetForm();

  //     // Call success callback after a short delay
  //     setTimeout(() => {
  //       setSuccess(null);
  //       onSubmissionSuccess?.();
  //     }, 2000);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to submit work");
  //   }
  // };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNotes("");
    setImages([]);
    setVideos([]);
    setLinks([]);
    setDocuments([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Submit Completed Work</h3>
        <p className="text-sm text-gray-600">
          Submit your completed deliverables
          {campaignTitle ? ` for "${campaignTitle}"` : ""}. The business will
          review your submission and either approve it or request changes.
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="submission-title">Title</Label>
          <Input
            id="submission-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title for your submission"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submission-description">Description</Label>
          <Textarea
            id="submission-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your completed work and key highlights..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submission-notes">Notes</Label>
          <Textarea
            id="submission-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes, challenges faced, or special instructions..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <Label>Media & Attachments</Label>

          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Links
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Add images of your completed work
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMediaItem("images")}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
                {images.map((item) => (
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    type="images"
                    onUpdate={updateMediaItem}
                    onRemove={removeMediaItem}
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Add videos showcasing your work
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMediaItem("videos")}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>
                {videos.map((item) => (
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    type="videos"
                    onUpdate={updateMediaItem}
                    onRemove={removeMediaItem}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="links" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Add relevant links (social media posts, websites, etc.)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMediaItem("links")}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                {links.map((item) => (
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    type="links"
                    onUpdate={updateMediaItem}
                    onRemove={removeMediaItem}
                    placeholder="https://instagram.com/p/... or https://website.com"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Add documents, PDFs, or other files
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMediaItem("documents")}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
                {documents.map((item) => (
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    type="documents"
                    onUpdate={updateMediaItem}
                    onRemove={removeMediaItem}
                    placeholder="https://drive.google.com/... or https://dropbox.com/..."
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Important Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Important Notice
                </p>
                <p className="text-sm text-blue-800">
                  Once you submit your work, the business has 7 days to review
                  and approve it. If no action is taken within 7 days, your
                  submission will be automatically approved and payment will be
                  released to your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
          Reset Form
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (!title.trim() && !description.trim() && !notes.trim())
          }
          className="min-w-[120px]"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit Work
        </Button>
      </div>
    </div>
  );
}
