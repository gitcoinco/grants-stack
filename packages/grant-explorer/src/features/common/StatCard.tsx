export function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded-2xl bg-[#F7F7F7] font-mono p-4">
      <div className="text-grey-400 text-4xl">{props.value}</div>
      <div className="font-bold text-md pb-4 mt-4">{props.title}</div>
    </div>
  );
}
