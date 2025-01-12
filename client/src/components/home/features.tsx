import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import FeatureIcon from "../icons/FeatureIcon";

export default function Features() {
  return (
    <section
      id="features"
      className="max-w-5xl w-full px-6 py-12 flex flex-col gap-4 justify-between sm:justify-between sm:flex-row"
    >
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col">
          <span className="text-secondary-500">Awesome Feature</span>
          <h3 className="text-2xl font-semibold">Your title here</h3>
        </div>
        <p className="max-w-96 text-default-500">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl, nec
          tincidunt nisl lorem eu nunc. Sed euismod, nisl ut aliquam lacinia,
        </p>

        <div className="py-2.5 gap-1.5 flex">
          <ArchiveBoxIcon className="w-5 h-5 mt-1 text-secondary-400" />
          <div className="flex flex-col">
            <h4 className="font-medium text-lg">Your title here</h4>
            <p className="max-w-96 text-default-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
            </p>
          </div>
        </div>
        <div className="py-2.5 gap-1.5 flex">
          <ArchiveBoxIcon className="w-5 h-5 mt-1 text-secondary-400" />
          <div className="flex flex-col">
            <h4 className="font-medium text-lg">Your title here</h4>
            <p className="max-w-96 text-default-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
            </p>
          </div>
        </div>
        <div className="py-2.5 gap-1.5 flex">
          <ArchiveBoxIcon className="w-5 h-5 mt-1 text-secondary-400" />
          <div className="flex flex-col">
            <h4 className="font-medium text-lg">Your title here</h4>
            <p className="max-w-96 text-default-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <FeatureIcon />
      </div>
    </section>
  );
}
