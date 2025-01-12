export const scrollToElement = (targetId: string, offset: number = 0): void => {
  const targetElement = document.querySelector(targetId);

  console.log({ targetElement });

  if (targetElement) {
    window.scrollTo({
      top: targetElement.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  }
};
