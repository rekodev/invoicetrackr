import LoginForm from "@/components/auth/login-form";
import AppLogo from "@/components/icons/AppLogo";

const LogInPage = () => {
  return (
    <section className="py-8 flex flex-col justify-center items-center gap-4">
      <AppLogo />
      <div className="flex flex-col justify-center items-center gap-1 mb-6">
        <h2 className="text-2xl font-medium">Welcome</h2>
        <p className="text-default-500">Log into your account to continue</p>
      </div>
      <LoginForm />
    </section>
  );
};

export default LogInPage;
