import { BaseQuestion, Round, RoundApplicationQuestion } from "data-layer";
import { GrantApplicationFormAnswer } from "../../../api/types";
import { renderToHTML } from "common";

export function ApplicationFormAnswers(props: {
  answers: GrantApplicationFormAnswer[];
  round: Round | undefined;
}) {
  const roundQuestions = props.round?.applicationQuestions as (BaseQuestion &
    RoundApplicationQuestion)[];
  let answers: GrantApplicationFormAnswer[] = [];
  if (roundQuestions) {
    answers = roundQuestions
      .filter((q) => !q.hidden && !q.encrypted)
      .map((q) => ({
        ...props.answers.find(
          (a) =>
            a.questionId === q.id && a.question === q.title && a.type === q.type
        ),
        question: q.title,
      }))
      .filter((a): a is GrantApplicationFormAnswer => !!a.answer);
  }

  if (answers.length === 0) {
    answers = props.answers.filter((a) => !!a.answer && !a.hidden);
  }

  if (answers.length === 0) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl mt-8 font-thin text-blue-800">
        Additional Information
      </h1>
      <div>
        {answers.map((answer) => {
          const answerText = Array.isArray(answer.answer)
            ? answer.answer.join(", ")
            : answer.answer;
          return (
            <div key={answer.questionId}>
              <p className="text-md mt-8 mb-3 font-semibold text-blue-800">
                {answer.question}
              </p>
              {answer.type === "paragraph" ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: renderToHTML(answerText.replace(/\n/g, "\n\n")),
                  }}
                  className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                ></p>
              ) : (
                <p
                  className="text-base text-blue-800"
                  dangerouslySetInnerHTML={{
                    __html: renderToHTML(answerText.replace(/\n/g, "\n\n")),
                  }}
                ></p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
