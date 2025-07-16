import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | PitchHype',
  description: 'Privacy Policy for PitchHype - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Effective Date:</strong> January 25, 2025</p>
              <p><strong>Last Updated:</strong> January 25, 2025</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                PitchHype ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-3">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Register for an account</li>
                <li>Create a user profile</li>
                <li>Apply for or create campaigns</li>
                <li>Communicate with other users</li>
                <li>Contact our support team</li>
                <li>Subscribe to our newsletter</li>
              </ul>

              <p className="text-gray-700 mb-3"><strong>Types of personal information include:</strong></p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Profile information (bio, location, interests)</li>
                <li>Social media account information</li>
                <li>Payment and billing information</li>
                <li>Identity verification documents</li>
                <li>Professional information (company details, portfolio)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 mb-3">
                We automatically collect certain information when you access our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, click patterns)</li>
                <li>Location data (general geographic location)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and analytics data</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.3 Third-Party Information</h3>
              <p className="text-gray-700 mb-3">
                We may receive information about you from third parties:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Social media platforms (when you connect your accounts)</li>
                <li>Payment processors</li>
                <li>Identity verification services</li>
                <li>Analytics providers</li>
                <li>Marketing partners</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Platform Operations</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Provide and maintain our services</li>
                <li>Process transactions and payments</li>
                <li>Facilitate communication between users</li>
                <li>Verify user identity and prevent fraud</li>
                <li>Provide customer support</li>
                <li>Send important service notifications</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Platform Improvement</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Analyze usage patterns and trends</li>
                <li>Develop new features and services</li>
                <li>Improve user experience</li>
                <li>Conduct research and analytics</li>
                <li>Test platform functionality</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Marketing and Communications</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Send promotional emails and newsletters (with consent)</li>
                <li>Personalize content and recommendations</li>
                <li>Conduct surveys and feedback collection</li>
                <li>Provide targeted advertising</li>
                <li>Announce new features and updates</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.4 Legal and Safety</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Comply with legal obligations</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect against fraud and abuse</li>
                <li>Resolve disputes</li>
                <li>Respond to legal requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 With Other Users</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Profile information visible to other platform users</li>
                <li>Campaign-related communications</li>
                <li>Reviews and ratings</li>
                <li>Public content and posts</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 With Service Providers</h3>
              <p className="text-gray-700 mb-3">
                We share information with trusted third-party service providers:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Payment processors (Stripe, PayPal)</li>
                <li>Cloud hosting services (AWS, Google Cloud)</li>
                <li>Analytics providers (Google Analytics)</li>
                <li>Email service providers</li>
                <li>Customer support tools</li>
                <li>Identity verification services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-3">
                We may disclose information when required by law:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>To comply with legal processes</li>
                <li>To respond to government requests</li>
                <li>To protect our rights and property</li>
                <li>To ensure user safety</li>
                <li>To investigate fraud or security issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Security Measures</h3>
              <p className="text-gray-700 mb-3">
                We implement appropriate technical and organizational measures:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and user permissions</li>
                <li>Incident response procedures</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Data Retention</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>We retain personal information only as long as necessary</li>
                <li>Account information is kept while accounts are active</li>
                <li>Transaction records are retained for legal and tax purposes</li>
                <li>Marketing data is retained until consent is withdrawn</li>
                <li>Backup data may be retained for disaster recovery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Access and Portability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Request access to your personal information</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>Review how your information is being used</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Correction and Updates</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Correct inaccurate personal information</li>
                <li>Update your profile and account settings</li>
                <li>Modify communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 Deletion and Erasure</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Request deletion of your personal information</li>
                <li>Close your account and remove profile data</li>
                <li>Note: Some information may be retained for legal purposes</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.4 Exercising Your Rights</h3>
              <p className="text-gray-700 mb-3">
                To exercise your privacy rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Email us at privacy@pitchype.com</li>
                <li>Use the privacy settings in your account</li>
                <li>Contact our support team</li>
                <li>We will respond within 30 days of receiving your request</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Types of Cookies</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Marketing Cookies:</strong> Used for advertising and personalization</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">7.2 Cookie Management</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You can control cookies through your browser settings</li>
                <li>Some features may not work if cookies are disabled</li>
                <li>We provide cookie preference controls in your account settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Our platform is not intended for users under 18 years of age</li>
                <li>We do not knowingly collect information from children under 18</li>
                <li>If we learn we have collected a child's information, we will delete it</li>
                <li>Parents can contact us if they believe their child has provided information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For privacy-related questions or concerns:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Email:</strong> privacy@pitchype.com</li>
                <li><strong>Address:</strong> [Company Address]</li>
                <li><strong>Data Protection Officer:</strong> dpo@pitchype.com</li>
              </ul>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600 italic">
                This Privacy Policy is designed to help you understand how we collect, use, and protect your information. 
                If you have any questions, please don't hesitate to contact us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}