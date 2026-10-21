import InfoPageLayout, { PolicySection } from "@/components/InfoPageLayout";

export const metadata = {
  title: "Privacy Policy – HAK Store",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      eyebrow="Policies"
      title="Privacy Policy"
      intro="How HAK Store collects, uses and protects your personal information."
      updated="21 October 2026"
    >
      <PolicySection title="1. Information we collect">
        <ul>
          <li><strong>Account details:</strong> your name, email address and password when you sign up.</li>
          <li><strong>Order details:</strong> your name, phone number, email, delivery address and the items you order.</li>
          <li><strong>Messages:</strong> anything you send us through the contact form.</li>
          <li><strong>Usage data:</strong> basic information about how you use the website, such as pages visited.</li>
        </ul>
      </PolicySection>

      <PolicySection title="2. How we use your information">
        <ul>
          <li>To process, deliver and support your orders.</li>
          <li>To manage your account and show your order history.</li>
          <li>To reply to your questions and requests.</li>
          <li>To send offers and news, only if you subscribe to our newsletter.</li>
          <li>To improve our website and services.</li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Sharing your information">
        <p>
          We do not sell your personal information. We only share it with delivery partners and service
          providers who need it to fulfil your order, or when required by law.
        </p>
      </PolicySection>

      <PolicySection title="4. Cookies and local storage">
        <p>
          We use cookies and your browser&apos;s local storage to keep you logged in, remember your
          cart and understand how the website is used. You can clear these at any time in your browser
          settings.
        </p>
      </PolicySection>

      <PolicySection title="5. Data security">
        <p>
          We take reasonable steps to protect your information from loss, misuse and unauthorised
          access. No method of transmission over the internet is completely secure, however.
        </p>
      </PolicySection>

      <PolicySection title="6. Your rights">
        <p>
          You can ask us to access, correct or delete your personal information, or unsubscribe from
          marketing emails at any time, by contacting us at Kamisofts@gmail.com.
        </p>
      </PolicySection>

      <PolicySection title="7. Changes to this policy">
        <p>
          We may update this policy from time to time. The latest version will always be on this page
          with the date it was last updated.
        </p>
      </PolicySection>
    </InfoPageLayout>
  );
}
