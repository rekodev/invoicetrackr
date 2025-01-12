import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

export default function Faq() {
  const renderFaqEntry = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="flex gap-2">
      <div className="mt-1.5">
        <ArchiveBoxIcon className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-4">
        <h4 className="text-2xl font-semibold">{title}</h4>
        <p className="text-default-500">{description}</p>
      </div>
    </div>
  );

  return (
    <section id="faq" className="max-w-5xl px-6 py-12 flex flex-col gap-12">
      <div className="flex flex-col items-center gap-1">
        <span className="text-secondary-500">FAQ</span>
        <h2 className="text-4xl font-semibold">You Have Questions?</h2>
        <p className="text-center max-w-[576px] mt-2 text-default-500">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet
        </p>
      </div>
      {renderFaqEntry({
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet",
      })}
      {renderFaqEntry({
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet Lorem ipsum dolor sit amet, aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet elit. Sed condimentum, nisl ut aliquam lacinia, nisl nisl aliquet aliquet",
      })}
    </section>
  );
}
