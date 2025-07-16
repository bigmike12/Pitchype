import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | PitchHype',
  description: 'Terms of Service for PitchHype - Read our terms and conditions for using the platform.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Effective Date:</strong> January 25, 2025</p>
              <p><strong>Last Updated:</strong> January 25, 2025</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using PitchHype ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                PitchHype is a digital platform that connects businesses with influencers for marketing campaigns. The Platform facilitates:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Campaign creation and management</li>
                <li>Influencer discovery and application processes</li>
                <li>Payment processing and escrow services</li>
                <li>Communication tools between businesses and influencers</li>
                <li>Performance tracking and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Account Registration</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Users must provide accurate and complete information during registration</li>
                <li>Users are responsible for maintaining the confidentiality of their account credentials</li>
                <li>Users must notify us immediately of any unauthorized use of their account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Account Types</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li><strong>Business Accounts:</strong> For companies seeking influencer marketing services</li>
                <li><strong>Influencer Accounts:</strong> For content creators offering marketing services</li>
                <li><strong>Admin Accounts:</strong> For platform administration (by invitation only)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Account Verification</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>We may require identity verification for certain account features</li>
                <li>Social media account linking may be required for influencers</li>
                <li>Business verification may be required for payment processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Prohibited Activities</h3>
              <p className="text-gray-700 mb-3">Users may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Engage in harassment, abuse, or discriminatory behavior</li>
                <li>Attempt to circumvent platform fees or payment systems</li>
                <li>Use automated systems to access the Platform without permission</li>
                <li>Share account credentials with third parties</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Content Standards</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All content must comply with platform community guidelines</li>
                <li>Content must not contain illegal, harmful, or offensive material</li>
                <li>Users retain ownership of their original content but grant PitchHype necessary licenses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Platform Fees</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>PitchHype charges service fees as disclosed during transaction processes</li>
                <li>Fees are subject to change with 30 days notice</li>
                <li>All fees are non-refundable unless otherwise specified</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Payment Processing</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Payments are processed through secure third-party providers</li>
                <li>Escrow services protect both businesses and influencers</li>
                <li>Payment disputes are handled according to our dispute resolution process</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 Taxes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Users are responsible for their own tax obligations</li>
                <li>PitchHype may provide tax documentation as required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Service Availability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>The Platform is provided "as is" without warranties</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>Maintenance and updates may temporarily affect availability</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Limitation of Liability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>PitchHype's liability is limited to the maximum extent permitted by law</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Total liability shall not exceed fees paid to PitchHype in the preceding 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                <li>Email: legal@pitchype.com</li>
                <li>Address: [Company Address]</li>
              </ul>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600 italic">
                These Terms of Service constitute the entire agreement between you and PitchHype regarding use of the Platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}