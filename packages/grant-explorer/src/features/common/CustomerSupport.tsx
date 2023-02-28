import { useEffect, useRef, useState } from "react";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Button } from "common/src/styles";

type Menu = {
  Icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  title: string;
  subTitle: string;
  link: string;
};

export const menuItems: Menu[] = [
  {
    Icon: BookOpenIcon,
    title: "Grants Explorer Guide",
    subTitle: "Best practices for project owners",
    link: "https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-protocol/funder-faq/grants-explorer-guide",
  },
  {
    Icon: ChatBubbleLeftRightIcon,
    title: "Contact Support",
    subTitle: "Reach our support team for help",
    link: "https://support.gitcoin.co/gitcoin-knowledge-base/misc/contact-us",
  },
  {
    Icon: ClipboardDocumentListIcon,
    title: "Give Feedback",
    subTitle: "Help us improve the product",
    link: "https://forms.gle/AcnGN9yYNwWwrEGH8",
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

export default function CustomerSupport() {
  const menuRef = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);

  const toggleMenu = () => setOpen(!open);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    listenForOutsideClicks({ listening, setListening, menuRef, setOpen })
  );
  const classes =
    "h-10 text-black-400 border-2 rounded-xl hover:brightness-400";
  return (
    <div className="relative" data-testid="customer-support" ref={menuRef}>
      <Button
        className={`flex items-center bg-transparent justify-center flex-row mt-2 mb-2 p-4 ${classes}`}
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
