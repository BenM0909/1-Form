export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-gray-700 leading-relaxed mb-6">
        Effective Date: January 1, 2025
      </p>
      <p className="text-gray-700 leading-relaxed mb-6">
        At 1-Form ("we," "us," "our"), your privacy and the security of your personal information are our top priorities. This Privacy Policy explains how we collect, use, store, and protect personal information you provide when using our platform for forms, registrations, and related services ("Services"). By accessing or using our Services, you agree to this Privacy Policy. If you do not agree, please refrain from using our platform.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>Personal identifiers (e.g., name, email address, phone number)</li>
        <li>Account information (e.g., username, password)</li>
        <li>Form data (e.g., responses to form questions, uploaded documents)</li>
        <li>Usage data (e.g., interactions with our Services, IP address, device information)</li>
        <li>Any additional data you voluntarily provide through our forms or communications</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">2. How We Protect Your Information</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        We implement a variety of security measures to maintain the safety of your personal information:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>
          <strong>Encryption:</strong> We use industry-standard encryption protocols to protect your data both in transit and at rest:
          <ul className="list-disc list-inside ml-6">
            <li>Data in transit is protected using TLS (Transport Layer Security) 1.2 or higher</li>
            <li>Data at rest is encrypted using AES-256 encryption</li>
            <li>We utilize HTTPS for all data transfers between your device and our servers</li>
          </ul>
        </li>
        <li>
          <strong>Access Control:</strong> We implement strict access controls and authentication mechanisms to ensure that only authorized personnel can access your data, and only for legitimate business purposes.
        </li>
        <li>
          <strong>Regular Security Audits:</strong> We conduct regular security audits and vulnerability assessments to identify and address potential security risks.
        </li>
        <li>
          <strong>Employee Training:</strong> Our staff undergoes regular privacy and security training to ensure they understand and follow best practices for data protection.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">3. How We Use Your Information</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        We use your information for the following purposes:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>To provide and maintain our Services</li>
        <li>To process and manage form submissions</li>
        <li>To communicate with you about our Services</li>
        <li>To improve and personalize your experience with our platform</li>
        <li>To comply with legal obligations</li>
        <li>To detect, prevent, and address technical issues or fraudulent activities</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">4. AI and Automated Processing</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        We utilize artificial intelligence (AI) and automated processing in our Services to enhance your experience and improve our platform:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>
          <strong>FormAI Assistant:</strong> Our AI-powered assistant helps users create forms, answer questions, and provide support. It processes user queries and form content to generate relevant responses and suggestions.
        </li>
        <li>
          <strong>FormAI Form Uploader:</strong> This feature uses AI to analyze uploaded documents and automatically generate form structures. It processes document content to extract relevant information and create customized forms.
        </li>
        <li>
          <strong>Data Analysis:</strong> We may use AI to analyze aggregated, anonymized data to improve our Services, identify trends, and enhance user experience.
        </li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        Our AI systems are designed with privacy and security in mind. They do not retain personal information beyond what is necessary to provide the requested service. You have the right to opt-out of AI-powered features at any time by contacting our support team.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">5. Sharing Information</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        We may share your information only under the following circumstances:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>With your consent or at your direction</li>
        <li>With service providers who assist in delivering our Services, under strict confidentiality agreements</li>
        <li>When required by law or to comply with legal processes</li>
        <li>To protect the rights, property, or safety of our users or others</li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        We do not sell, rent, or share your personal information with third parties for their marketing purposes.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">6. Your Rights</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Depending on your location, you may have certain rights regarding your personal information:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>Access or receive a copy of your personal information</li>
        <li>Correct inaccurate personal information</li>
        <li>Delete your personal information (subject to certain exceptions)</li>
        <li>Restrict or object to certain processing of your data</li>
        <li>Data portability (receive your data in a structured, commonly used format)</li>
        <li>Withdraw consent for data processing at any time (where processing is based on consent)</li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        To exercise these rights or for any privacy-related inquiries, please contact our Data Protection Officer at privacy@1-form.com.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">7. Data Retention</h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. When data is no longer needed, we securely delete or anonymize it.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">8. International Data Transfers</h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that appropriate safeguards are in place to protect your information.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">9. Children's Privacy</h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">10. Changes to This Policy</h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website with a new effective date. Your continued use of our Services after such changes constitutes your acceptance of the revised policy.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">11. Contact Us</h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
      </p>
      <p className="text-gray-700 leading-relaxed mb-6">
        1-Form Privacy Team<br />
        Email: privacy@1-form.com<br />
        Address: 123 Form Street, Suite 456, Formville, FO 78901
      </p>
    </div>
  );
}

