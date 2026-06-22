import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@common/components/ui/form";
import { SpinnerInput } from "@common/components/ui/spinner-input";

import SliderContainer, {
  type SliderProps,
} from "@common/components/containers/SliderContainer";

import { useEffect, useState } from "react";
import { NUMBER_REGEX } from "@common/lib/core/const";
import { useFormContext } from "react-hook-form";

interface SliderFormContainerProps extends Omit<
  SliderProps,
  "min" | "max" | "step"
> {
  desc?: React.ReactNode;
  inputControl?: boolean;
  label: React.ReactNode;
  name: string;
  required?: boolean;
  valueList: number[];
  stepList?: number[];
  minValue: number;
  maxValue: number;
  errorMessage?: string;
  stepInput?: number;
  onChangeValue?: (value: number) => void;
}

const SliderFormContainer: React.FC<SliderFormContainerProps> = ({
  inputControl = true,
  desc,
  label,
  name,
  required,
  valueList,
  minValue,
  maxValue,
  stepList,
  errorMessage,
  stepInput,
  onChangeValue,
  ...props
}) => {
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [valueTemp, setValueTemp] = useState<number>(0);
  const { control, setValue, setError, clearErrors, getValues } =
    useFormContext();

  const fieldValue = getValues(name) as number;

  const stepValues: Record<number, number> = {};
  const steps: Record<number, React.ReactNode> = {};
  const stepSet = new Set(stepList ?? valueList);

  valueList.forEach((value, index) => {
    const step = (index / (valueList.length - 1)) * 100;
    stepValues[step] = value;
    const isHidden = stepSet.has(value) ? "" : "opacity-0";
    steps[step] = (
      <button
        className={`absolute -top-11 -translate-x-1/2 text-base text-neutral-900 ${isHidden}`}
        onClick={() => {
          setSliderValue(value);
          setValue(name, stepValues[step]);
          clearErrors([name]);
        }}
      >
        {value}
      </button>
    );
  });

  useEffect(() => {
    if (typeof getValues(name) === "number") {
      const currentValue: number = getValues(name) as number;
      const index = valueList.findIndex((item) => item === currentValue);
      setValueTemp(currentValue);
      setSliderValue((index / (valueList.length - 1)) * 100);
    }
  }, [getValues, name, valueList, fieldValue]);

  const handleMouseMove = (percentage: number) => {
    const closestValue =
      Math.round((percentage / 100) * (maxValue - minValue)) + minValue;
    setValueTemp(closestValue);
  };

  const handleSpinnerChange = (newValue: number) => {
    const index = valueList.findIndex((item) => item === newValue);
    if (index !== -1) {
      onChangeValue?.(newValue);
      setSliderValue((index / (valueList.length - 1)) * 100);
      setValue(name, newValue);
      clearErrors([name]);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <FormLabel className="text-base">
              {label}
              {required && <span className="text-primary-100"> *</span>}
            </FormLabel>
            <FormDescription className="text-base text-neutral-400">
              {desc}
            </FormDescription>
          </div>
          <div className="flex h-10 items-end gap-6 2xl:gap-12">
            <div className="w-full">
              <SliderContainer
                marks={steps}
                step={null}
                valueTemp={valueTemp}
                value={sliderValue}
                onChange={(value: number | number[]) => {
                  if (!Array.isArray(value)) {
                    setSliderValue(value);
                    handleMouseMove(value);
                  }
                }}
                onChangeComplete={(value: number | number[]) => {
                  if (!Array.isArray(value)) {
                    onChangeValue?.(stepValues[value] ?? 0);
                    setValue(name, stepValues[value] ?? 0);
                    clearErrors([name]);
                  }
                }}
                {...props}
              />
            </div>

            <FormControl
              className={inputControl ? "relative space-y-0" : "hidden"}
            >
              <SpinnerInput
                {...field}
                className="custom-number-input bg-neutral-100 text-center font-semibold leading-6 text-neutral-800"
                fullWidth={false}
                max={maxValue}
                min={minValue}
                step={stepInput}
                onStepChange={handleSpinnerChange}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = +e.target.value;
                  const index = valueList.findIndex((item) => item === value);

                  if (index !== -1) {
                    setSliderValue((index / (valueList.length - 1)) * 100);
                    clearErrors([name]);
                  } else {
                    setError(name, {
                      message: errorMessage,
                    });
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const inputValue = e.target.value.trim();
                  const index = valueList.findIndex(
                    (item) => item === +e.target.value,
                  );
                  if (NUMBER_REGEX.test(inputValue) || inputValue === "") {
                    setValue(name, +inputValue);
                  }
                  if (index !== -1) {
                    setSliderValue((index / (valueList.length - 1)) * 100);
                    clearErrors([name]);
                  }
                }}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SliderFormContainer;
