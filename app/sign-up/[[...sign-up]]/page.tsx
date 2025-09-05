import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join SteppersLife to start organizing events
          </p>
        </div>
        
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-cyan-600 hover:bg-cyan-700 text-white transition-colors",
              card: "shadow-xl border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
              formFieldInput:
                "border-gray-300 dark:border-gray-600 dark:bg-gray-800",
              footerActionLink:
                "text-cyan-600 hover:text-cyan-700 dark:text-cyan-400",
              identityPreviewEditButtonIcon: "text-cyan-600",
              identityPreviewText: "text-gray-700 dark:text-gray-300",
              formHeaderTitle: "text-xl font-semibold",
              formHeaderSubtitle: "text-gray-600 dark:text-gray-400",
              otpCodeFieldInput: "border-gray-300 dark:border-gray-600",
              formResendCodeLink: "text-cyan-600 hover:text-cyan-700",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
          redirectUrl="/organizer/onboarding"
          signInUrl="/sign-in"
        />
        
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Already have an account?{" "}
            <a href="/sign-in" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium">
              Sign in
            </a>
          </p>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>
            By signing up, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}