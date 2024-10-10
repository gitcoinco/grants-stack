export function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded-2xl bg-[#F7F7F7] font-mono px-6 py-7">
      <div className="text-grey-400 text-4xl">{props.value}</div>
      <div className="font-bold text-md mt-6">{props.title}</div>
    </div>
  );
}
