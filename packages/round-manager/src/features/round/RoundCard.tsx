import { CalendarIcon } from "common";
import {
  BasicCard,
  CardContent,
  CardTitle,
  CardDescription,
} from "../common/styles";
import { CardProps } from "../common/types";

export const RoundCard: React.FC<CardProps> = (props: CardProps) => (
  <BasicCard className="border border-gray-200 w-full mb-8 rounded-xl md:h-[220px]">
    <CardContent className="p-4 px-5">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="font-medium text-2xl font-sans">
            {props.title}
          </CardTitle>
          <CardDescription className=" text-gray-500">
            <div className="flex flex-col mt-4">
              <div>
                <span
                  className={`border border-${props.color} rounded-2xl bg-${props.color} p-1 px-2 font-mono`}
                >
                  {props.description}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex flex-row items-center p-1 text-gray-400 font-sans">
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  <span className="text-lg">{props.displayDate}</span>
                </div>
              </div>
            </div>
          </CardDescription>
        </div>
        <div className="flex justify-end text-sm font-mono mt-16">
          {/* todo: figure out the status display by dates */}
          <span
            className={`border-none p-1 px-3 rounded-full ${props.status && props.status.style}`}
          >
            {props.status && props.status.status}
          </span>
        </div>
      </div>
    </CardContent>
    <div>
      <div className="pl-6 bg-white">{props.footerContent}</div>
    </div>
  </BasicCard>
);
