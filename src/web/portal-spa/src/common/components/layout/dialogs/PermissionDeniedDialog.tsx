"use client";

const getActionList = (_args: { urn: string }) =>
  Promise.resolve({
    success: true,
    status: 200,
    data: { results: [] as { urn: string; displayName: string }[] },
  } as const);
import useFetchDialogContent from "@common/hooks/useFetchDialogContent";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

export default function PermissionDeniedDialog({
  urn,
}: Readonly<{ urn: string }>) {
  const t = useLayoutStore((state) => state.t);

  const { data: actions } = useFetchDialogContent({
    cacheKey: urn,
    getApi: () => getActionList({ urn }),
  });

  const actionName =
    actions?.results.find((item) => item.urn === urn)?.displayName ?? "";

  return (
    <div className="text-base">
      {t("common.allowed_actions.permission_denied_note_1")}
      <span className="font-semibold">{actionName}</span>
      {t("common.allowed_actions.permission_denied_note_2")}
      <span className="font-semibold">{urn}</span>
    </div>
  );
}

export function usePermissionDialog() {
  const { openDialog, t } = useLayoutStore((state) => ({
    openDialog: state.openDialog,
    t: state.t,
  }));

  const openPermissionDeniedDialog = (urn: string) => {
    openDialog(
      {
        title: t("common.allowed_actions.permission_denied"),
        dialogContent: <PermissionDeniedDialog urn={urn} />,
        className: "min-w-[40.625rem]",
        cancelText: t("common.actions.close"),
        okElement: <></>,
      },
      { buttonProps: {} },
    );
  };

  return { openPermissionDeniedDialog };
}
