export function AvatarWithTitle({
  avatarSrc,
  avatarAlt,
  title,
  dataTestId,
}: {
  avatarSrc: string;
  avatarAlt?: string;
  title: string;
  dataTestId?: { title?: string; avatar?: string };
}) {
  return (
    <div className="flex items-center">
      <img
        className="w-10 h-10 rounded-full mr-4 my-auto"
        src={avatarSrc}
        alt={avatarAlt ?? "avatar image"}
        data-testid={dataTestId?.avatar}
      />
      <div
        className="text-lg lg:text-4xl"
        data-testid={dataTestId?.title}
        title={title}
      >
        {title}
      </div>
    </div>
  );
}
