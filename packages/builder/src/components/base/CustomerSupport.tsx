import { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

type Menu = {
  Icon: any;
  title: string;
  subTitle: string;
  link: string;
};

export const menuItems: Menu[] = [
  {
    Icon: BookOpenIcon,
    title: "Builder Guide",
    subTitle: "Best practices for project owners",
    link: "https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/project-owners",
  },
  {
    Icon: ClipboardDocumentListIcon,
    title: "Give Feedback",
    subTitle: "Help us improve the product",
    link: "https://forms.gle/XxqRtP1WbaL3cLNA8",
  },
  {
    Icon: CodeBracketIcon,
    title: "Developer Docs",
    subTitle: "Build on top of Builder",
    link: "https://docs.allo.gitcoin.co",
  },
];

function listenForOutsideClicks({
  listening,
  setListening,
  menuRef,
  setOpen,
}: {
  listening: boolean;
  setListening: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return () => {
    if (listening) return;
    if (!menuRef.current) return;
    setListening(true);
    [`click`, `touchstart`].forEach((type) => {
      document.addEventListener(type, (evt) => {
        if (menuRef.current && menuRef.current.contains(evt.target as Node)) {
          return;
        }
        setOpen(false);
      });
    });
  };
}

function CustomerSupport() {
  const menuRef = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);

  const toggleMenu = () => setOpen(!open);

  useEffect(
    listenForOutsideClicks({ listening, setListening, menuRef, setOpen })
  );

  return (
    <div className="relative" data-testid="customer-support" ref={menuRef}>
      <Button
        colorScheme="black"
        variant="ghost"
        className="flex items-center justify-center flex-row mt-2 ml-2 mb-2 border shadow-[0px_0px_2px_0px_rgba(0,0,0,0.1)] cs-button"
        onClick={toggleMenu}
      >
        <div className="fill-current w-6 h-6 mr-2">
          <QuestionMarkCircleIcon />
        </div>
        <span className="text-lg">Help</span>
      </Button>
      {open && (
        <div className="w-72 flex flex-col absolute right-0 rounded bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-4 px-4 z-20">
          {menuItems.map(({ Icon, title, subTitle, link }) => (
            <a
              target="_blank"
              href={link}
              className="flex flex-1 my-3"
              rel="noreferrer"
              key={title}
            >
              <div className="w-5 h-5 mr-3 text-gitcoin-violet-400">
                <Icon />
              </div>
              <div className="flex flex-1 flex-col">
                <h4 className="text-base">{title}</h4>
                <span className="text-sm text-gitcoin-grey-400 mt-1">
                  {subTitle}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerSupport;
