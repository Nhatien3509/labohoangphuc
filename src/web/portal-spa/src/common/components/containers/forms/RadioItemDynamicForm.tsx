import dynamic from "next/dynamic";

const RadioItemDynamicForm = dynamic(
  () => import("@common/components/containers/forms/RadioItemForm"),
  { ssr: false },
);

export default RadioItemDynamicForm;
