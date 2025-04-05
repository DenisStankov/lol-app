import Navigation from '@/components/navigation';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#C89B3C] mb-8">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to LoLytics ("we," "our," or "us"). We respect your privacy and are committed 
              to protecting your personal information. This Privacy Policy explains how we collect, use, 
              and safeguard your information when you use our League of Legends statistics and analysis service.
            </p>
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">2. Information We Collect</h2>
            <p className="mb-4">
              Our application collects the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>League of Legends Game Data:</strong> Champion statistics, match histories, and gameplay 
                information obtained through the Riot Games API.
              </li>
              <li>
                <strong>Device Information:</strong> Information about your device, operating system, and browser when 
                you access our application.
              </li>
              <li>
                <strong>Usage Information:</strong> How you interact with our application, including pages visited 
                and features used.
              </li>
            </ul>
            <p className="mt-4">
              We do not collect personal information beyond what is necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">3. How We Use Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide champion analysis and statistics</li>
              <li>Improve and optimize our application</li>
              <li>Troubleshoot and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell your data to third parties. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who assist in delivering our service</li>
              <li>If required by law or to protect rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information from unauthorized
              access or disclosure. However, no method of transmission over the Internet or method of 
              electronic storage is 100% secure. We strive to use commercially acceptable means to 
              protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">6. Your Rights</h2>
            <p className="mb-4">
              You may have rights regarding your data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to what information we hold about you</li>
              <li>Deletion of your information</li>
              <li>Objection to how we use your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify users of any material changes
              by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy
              periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">8. Contact Information</h2>
            <p>
              For questions about this Privacy Policy, please contact us at: support@lolytics-example.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">9. Riot Games API</h2>
            <p>
              LoLytics isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games 
              or anyone officially involved in producing or managing League of Legends. League of Legends and 
              Riot Games are trademarks or registered trademarks of Riot Games, Inc.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 