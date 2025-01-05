export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-gray-700 leading-relaxed mb-6">
        Effective Date: January 1, 2025
      </p>
      <p className="text-gray-700 leading-relaxed mb-6">
        At 1-Form (“we,” “us,” “our”), your privacy and the security of your personal information are our top priorities. This Privacy Policy explains how we collect, use, store, and protect personal information you provide when using our platform for forms, registrations, and related services (“Services”). By accessing or using our Services, you agree to this Privacy Policy. If you do not agree, please refrain from using our platform.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">1. Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 mb-6">
        <li>Name, email address, phone number</li>
        <li>Date of birth, emergency contact details, and other form-related information</li>
        <li>Any additional data you voluntarily provide through our forms</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">2. How We Protect Your Information</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 mb-6">
        <li>
          <strong>Encryption:</strong> All personal information is encrypted both in transit and at rest using industry-standard encryption protocols (e.g., HTTPS, AES-256).
        </li>
        <li>
          <strong>Access Control:</strong> Data is accessible only to authorized personnel for legitimate business purposes.
        </li>
        <li>
          <strong>Monitoring:</strong> Our systems are monitored for unauthorized access and security breaches.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">3. How We Use Your Information</h2>
      <p className="text-gray-700 leading-relaxed mt-2 mb-6">
        Your information is used solely for the purpose of delivering the Services, including:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>Managing registrations, camp/event logistics, or other form-related activities</li>
        <li>Responding to inquiries or providing customer support</li>
        <li>Fulfilling legal or regulatory obligations</li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        We do not sell, rent, or share your personal information with third parties for their marketing purposes.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">4. Sharing Information</h2>
      <p className="text-gray-700 leading-relaxed mt-2 mb-6">
        We may share your information only under the following circumstances:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>
          With service providers who assist in delivering our Services (e.g., payment processors) under strict confidentiality and security obligations
        </li>
        <li>When required by law or to comply with legal processes</li>
        <li>To protect the rights, property, or safety of our users or others</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">5. Your Rights</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 mb-6">
        <li>Access or correct your personal information</li>
        <li>Request deletion of your personal information, subject to legal or operational requirements</li>
        <li>Withdraw consent for data processing at any time</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">6. Data Retention</h2>
      <p className="text-gray-700 leading-relaxed mt-2 mb-6">
        Personal information is retained only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-6">7. Changes to This Policy</h2>
      <p className="text-gray-700 leading-relaxed mt-2 mb-6">
        This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. Updates will be posted with the “Effective Date” indicated. Continued use of the Services after any changes constitutes acceptance of the revised policy.
      </p>
    </div>
  );
}

