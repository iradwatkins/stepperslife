import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to access your organizer dashboard
          </p>
        </div>
        
        <SignIn 
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
          redirectUrl="/organizer"
          signUpUrl="/sign-up"
        />
        
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Don't have an account?{" "}
            <a href="/sign-up" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium">
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}