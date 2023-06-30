export function StatCard(props: { title: string; value: string | undefined }) {
  return (
    <div className="rounded border border-violet-400 p-4">
      <div className="font-bold text-md pb-4">{props.title}</div>
      <div className="text-grey-400 text-2xl">{props.value}</div>
    </div>
  );
}
