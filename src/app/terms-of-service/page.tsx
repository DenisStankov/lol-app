import Navigation from '@/components/navigation';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#C89B3C] mb-8">Terms of Service</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using LoLytics (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">2. Description of Service</h2>
            <p>
              LoLytics is a League of Legends champion analysis tool that provides champion details, match analysis, 
              build recommendations, and related statistics using data from the Riot Games API.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">3. Use of the Service</h2>
            <p className="mb-4">
              You agree to use the service for personal, non-commercial purposes only. You shall not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attempt to decompile, reverse engineer or disassemble any portion of the application</li>
              <li>Create derivative works based on the application</li>
              <li>Use the application in any manner that could damage, disable, or impair the service</li>
              <li>Use automated scripts to access the service</li>
              <li>Use the service to engage in any unlawful or prohibited activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">4. Riot Games Data</h2>
            <p>
              This application uses data from the Riot Games API. We are not endorsed by Riot Games and do not 
              reflect the views or opinions of Riot Games or anyone officially involved in producing or managing 
              League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of 
              Riot Games, Inc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">5. User Accounts</h2>
            <p>
              If the Service requires you to create an account, you are responsible for maintaining the 
              confidentiality of your account and password. You agree to accept responsibility for all 
              activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">6. Intellectual Property</h2>
            <p>
              All content included as part of the Service, such as text, graphics, logos, and software, 
              is the property of LoLytics or its content suppliers and protected by copyright and other laws. 
              Our use of Riot Games&apos; intellectual property is in accordance with Riot Games&apos; Legal Jibber Jabber 
              and Developer Policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">7. Modification of Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the application after 
              such changes constitutes your consent to the changes. We will notify users of any material 
              changes to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">8. Termination</h2>
            <p>
              We reserve the right to terminate your access to the application for violation of these Terms, 
              at our sole discretion, without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">9. Limitation of Liability</h2>
            <p>
              LoLytics is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. 
              We shall not be liable for any damages arising from the use of this application. 
              In no event will we be liable for any indirect, consequential, exemplary, incidental, 
              special or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which LoLytics operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">11. Contact Information</h2>
            <p>
              For questions regarding these Terms, please contact us at: support@lolytics-example.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 