import SignUpForm from '@/components/auth/sign-up-form';
import AcmeLogo from '@/components/icons/AcmeLogo';

const SignUpPage = () => {
  return (
    <section className='flex flex-col justify-center items-center gap-4'>
      <AcmeLogo />
      <div className='flex flex-col justify-center items-center gap-1 mb-6'>
        <h2 className='text-2xl font-medium'>Welcome</h2>
        <p className='text-default-500'>Create an account to get started</p>
      </div>
      <SignUpForm />
    </section>
  );
};

export default SignUpPage;
