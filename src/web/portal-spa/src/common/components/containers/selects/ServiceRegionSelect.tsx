"use client";

import SelectForm, {
  type SelectFormProps,
} from "@common/components/containers/forms/SelectForm";
import AllowedActionButton from "@common/components/containers/buttons/AllowedActionButton";
import BaseDialogContainer from "@common/components/containers/dialogs/BaseDialogContainer";
import { Button } from "@common/components/ui/button";
import toast from "@common/components/ui/toast";

import { Check } from "@common/components/icons";

import {
  type ControlProps,
  type GroupBase,
  type MenuListProps,
  type OptionProps,
  components,
} from "react-select";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  activateRegionServices,
  getProjectRegionsByService,
} from "@/api/common/common.actions";
const ADMIN = "admin";
type Service = { id: string; name: string };
import type { ServiceName } from "@common/lib/core/types";
import { cn } from "@common/lib/core/utils";
import { useActionAPI } from "@common/hooks/useActionAPI";
import { useFormContext } from "react-hook-form";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { usePathname } from "next/navigation";
import { withExtraProps } from "@common/components/containers/Hoc";

const FIRST = "first";
const REGION = "region";

type RegionOption = {
  value: string;
  label: string;
  isActive: boolean;
  description?: string;
};

type CustomRegionControlProps = ControlProps<
  unknown,
  boolean,
  GroupBase<unknown>
> & {
  currentFocused: React.MutableRefObject<RegionOption | undefined>;
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CustomRegionControl = ({
  currentFocused,
  setMenuIsOpen,
  ...props
}: CustomRegionControlProps) => {
  const propsControl = props as ControlProps<
    RegionOption,
    false,
    GroupBase<RegionOption>
  >;

  return (
    <components.Control
      {...propsControl}
      innerProps={{
        ...propsControl.innerProps,
        // prevent select option not active
        onKeyDown: (e) => {
          if (e.key === "Enter" && !currentFocused.current?.isActive) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (e.key === "Enter") {
            setMenuIsOpen(false);
          }
          propsControl.innerProps.onKeyDown?.(e);
        },
      }}
    />
  );
};

type CustomMenuListProps = MenuListProps<
  unknown,
  boolean,
  GroupBase<unknown>
> & {
  currentFocused: React.MutableRefObject<RegionOption | undefined>;
  currentService: Service | undefined;
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpenDialogActiveService: React.Dispatch<React.SetStateAction<boolean>>;
  menuIsOpen: boolean;
  fetchRegion: () => Promise<void>;
};

const CustomMenuList = ({
  currentFocused,
  currentService,
  menuIsOpen,
  setMenuIsOpen,
  fetchRegion,
  setIsOpenDialogActiveService,
  ...props
}: CustomMenuListProps) => {
  const menuProps = props as MenuListProps<
    RegionOption,
    false,
    GroupBase<RegionOption>
  >;
  const focusedOption =
    (menuProps.focusedOption as RegionOption | null) ?? undefined;

  const options = menuProps.options as RegionOption[] | null;
  const { innerProps } = menuProps;
  const { t, currentMember } = useLayoutStore((state) => ({
    t: state.t,
    currentMember: state.currentMember,
  }));
  const isAdmin = currentMember?.role === ADMIN;
  currentFocused.current = focusedOption;

  const [markerPos, setMarkerPos] = useState<{ top?: number; bottom?: number }>(
    {},
  );

  useEffect(() => {
    const menuListEl = document.getElementById(innerProps.id ?? "");
    if (!menuListEl || !focusedOption || focusedOption.isActive) return;

    const focusedIndex =
      options?.findIndex((opt) => opt.value === focusedOption.value) ?? -1;
    if (focusedIndex < 0) return;

    const baseElId = (innerProps.id ?? "").replace(/listbox$/, "");

    const optionElId = `${baseElId}option-${focusedIndex}`;
    const popUpEl = menuListEl.childNodes[0]?.lastChild as HTMLElement | null;
    const popUpHeight = popUpEl?.offsetHeight ?? 0;

    const handleScroll = () => {
      const optionEl = document.getElementById(optionElId);
      if (!optionEl) return;
      const menuSCrollTop = menuListEl.scrollTop;
      const optionTop = optionEl.offsetTop;
      const markerTop = optionTop - popUpHeight / 2 - menuSCrollTop;
      setMarkerPos({ top: markerTop });
    };

    handleScroll();
    menuListEl.addEventListener("scroll", handleScroll);

    return () => {
      menuListEl.removeEventListener("scroll", handleScroll);
    };
  }, [focusedOption, options, innerProps.id]);

  return (
    <>
      <components.MenuList {...menuProps} className="scrollbar fixed">
        {menuProps.children}
      </components.MenuList>
      {focusedOption && (
        <div
          style={markerPos}
          className={cn(
            "pointer-events-none absolute left-[9.375rem] flex w-[17.6875rem] flex-col gap-2.5 rounded-lg bg-neutral-0 p-6 opacity-0 shadow-D-X0-Y0-B10-S0-30 base-transition",
            {
              "pointer-events-auto opacity-100": !focusedOption.isActive,
            },
          )}
        >
          <span className="text-md font-semibold leading-5">
            {t("region_activation.active_service_in_region")}
          </span>
          <p className="text-base">
            {t("region_activation.active_service_desc")}
          </p>

          <AllowedActionButton
            isAllowedAction={isAdmin}
            className="w-full"
            onClick={() => {
              setMenuIsOpen(false);
              setIsOpenDialogActiveService(true);
            }}
            content={t("region_activation.permission_owner_required")}
          >
            {t("region_activation.active_now")}
          </AllowedActionButton>
        </div>
      )}
    </>
  );
};

type CustomRegionOptionProps = OptionProps<
  unknown,
  boolean,
  GroupBase<unknown>
> & {
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CustomRegionOption = ({
  setMenuIsOpen,
  ...props
}: CustomRegionOptionProps) => {
  const optionProps = props as OptionProps<
    RegionOption,
    false,
    GroupBase<RegionOption>
  >;
  const { data, isSelected } = optionProps;

  return (
    <components.Option
      {...optionProps}
      className={cn(
        "!flex min-h-9 !cursor-pointer !flex-col justify-center !px-6",
        {
          "!cursor-default !font-normal": !data.isActive,
        },
      )}
      innerProps={{
        ...optionProps.innerProps,
        onClick: (e) => {
          // prevent click option not active
          if (!data.isActive) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          setMenuIsOpen(false);
          optionProps.innerProps.onClick?.(e);
        },
      }}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span
            className={cn({
              "text-base text-neutral-300": !data.isActive,
            })}
          >
            {data.label}
          </span>
          {data.description && (
            <span className="text-xs text-neutral-400">{data.description}</span>
          )}
        </div>
        {isSelected && <Check size={24} className="-mr-3 text-primary-100" />}
      </div>
    </components.Option>
  );
};

const ServiceRegionSelect = ({
  name = REGION,
  label = "Region",
  serviceName,
  defaultSelect,
  ...props
}: Omit<SelectFormProps, "name"> & {
  name?: string;
  serviceName?: ServiceName;
  defaultSelect?: string;
}) => {
  const { currentProject, services, t } = useLayoutStore((state) => ({
    services: state.services,
    currentProject: state.currentProject,
    t: state.t,
  }));
  const { executeActionWithKey, loadingStates } = useActionAPI({
    fetchRegions: false,
    activeRegion: false,
  });
  const [options, setOptions] = useState<RegionOption[]>([]);
  const pathName = usePathname();
  const { setValue } = useFormContext();

  const currentService = useMemo(() => {
    const segment = (serviceName ?? pathName.split("/")[2])
      ?.toLocaleLowerCase()
      .replaceAll(" ", "-");
    return services.find((s) =>
      segment?.includes(s.name.toLowerCase().replaceAll(" ", "-")),
    );
  }, [pathName, serviceName, services]);

  const currentFocused = useRef<RegionOption | undefined>();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [isOpenDialogActiveService, setIsOpenDialogActiveService] =
    useState(false);

  const fetchRegion = async () => {
    if (!currentService?.id) return;
    const res = await executeActionWithKey(
      getProjectRegionsByService,
      "fetchRegions",
      currentService.id,
    );
    const results = res?.data?.results ?? [];

    if (!res?.success || !results.length) {
      setOptions([]);
      return;
    }

    const options = results
      .map(({ region, active }) => ({
        value: region.id,
        label: region.name,
        description: region.description,
        isActive: active,
      }))
      .filter(
        (opt, idx, arr) => idx === arr.findIndex((o) => o.value === opt.value),
      );

    setOptions(options);

    if (defaultSelect === FIRST) {
      const firstActive = options.find((o) => o.isActive);
      if (firstActive) {
        setValue(REGION, firstActive);
      }
      return;
    }

    const found = options.find((o) => o.value === defaultSelect);
    if (!found) return;
    setValue(REGION, found);
  };

  useEffect(() => {
    fetchRegion().catch((e: unknown) => {
      console.error(e);
    });
  }, [currentService?.id, currentProject?.id]);

  const ControlWrapper = useCallback(
    (props: ControlProps<unknown, boolean, GroupBase<unknown>>) => (
      <CustomRegionControl
        {...props}
        currentFocused={currentFocused}
        setMenuIsOpen={setMenuIsOpen}
      />
    ),
    [currentFocused, setMenuIsOpen],
  );

  const handleActiveService = async () => {
    const res = await executeActionWithKey(
      activateRegionServices,
      "activeRegion",
      {
        regionId: currentFocused.current?.value ?? "",
        serviceIds: [currentService?.id ?? ""],
      },
      false,
    );
    if (res?.success) {
      toast(t("region_activation.active_service_successfully"));
      setIsOpenDialogActiveService(false);
      fetchRegion().catch(console.error);
    }
  };

  return (
    <>
      <SelectForm
        isLoading={loadingStates.fetchRegions}
        isDisabled={loadingStates.fetchRegions && options.length > 0}
        required
        menuIsOpen={menuIsOpen}
        onMenuClose={() => {
          setMenuIsOpen(false);
        }}
        onMenuOpen={() => {
          setMenuIsOpen(true);
        }}
        options={options}
        name={name}
        label={label}
        components={{
          Option: withExtraProps(CustomRegionOption, { setMenuIsOpen }),
          MenuList: withExtraProps(CustomMenuList, {
            currentFocused,
            currentService,
            setMenuIsOpen,
            menuIsOpen,
            fetchRegion,
            setIsOpenDialogActiveService,
          }),
          Control: ControlWrapper,
        }}
        {...props}
      />
      <BaseDialogContainer
        isOpen={isOpenDialogActiveService}
        onOpen={(isOpen) => {
          setIsOpenDialogActiveService(isOpen);
        }}
        okElement={
          <Button
            onClick={() => {
              handleActiveService().catch(console.error);
            }}
            isLoading={loadingStates.activeRegion}
            leftIcon={<Check />}
          >
            {t("region_activation.active")}
          </Button>
        }
        title={t("region_activation.active_service")}
        cancelText={t("common.actions.close")}
      >
        <div>
          {t("region_activation.confirmation_message1")}
          <b> {currentService?.name} </b>
          {t("region_activation.confirmation_message2")}
          <b> {currentFocused.current?.label} </b>
          {t("region_activation.confirmation_message3")}
        </div>
      </BaseDialogContainer>
    </>
  );
};

export default memo(ServiceRegionSelect);
