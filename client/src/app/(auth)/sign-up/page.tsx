import SignUpForm from "@/components/auth/sign-up-form";
import AppLogo from "@/components/icons/AppLogo";

const SignUpPage = () => {
  return (
    <section className="px-6 py-8 flex flex-col justify-center items-center gap-4">
      <AppLogo />
      <div className="flex flex-col justify-center items-center gap-1 mb-6">
        <h2 className="text-2xl font-medium">Welcome</h2>
        <p className="text-default-500">Create an account to get started</p>
      </div>
      <SignUpForm />
    </section>
  );
};

export default SignUpPage;
