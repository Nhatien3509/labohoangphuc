"use client";

import { cn } from "@common/lib/core/utils";
import { useState } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonNodeProps = {
  data: JsonValue;
  nodeKey?: string | null;
};

function JsonNode({ data, nodeKey = null }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (data !== null && typeof data === "object") {
    const isArr = Array.isArray(data);
    const keys = Object.keys(data);

    return (
      <div>
        <span
          onClick={() => {
            setCollapsed((c) => !c);
          }}
          className="cursor-pointer select-none"
        >
          <span
            className={cn(
              "inline-block w-3.5 transition-transform",
              collapsed && "-rotate-90",
            )}
          >
            ▾
          </span>
          {nodeKey != null && (
            <span className="text-[#9CDCFE]">&quot;{nodeKey}&quot;: </span>
          )}
          <span className="text-[#d4d4d4]">{isArr ? "[" : "{"}</span>
          {collapsed && (
            <span className="text-[11px] text-neutral-400">
              {" "}
              {keys.length} items
            </span>
          )}
        </span>

        {!collapsed && (
          <div className="ml-[18px] border-l border-white/10 pl-2.5">
            {keys.map((k, i) => (
              <div key={k}>
                <JsonNode
                  data={(data as Record<string, JsonValue>)[k] as JsonValue}
                  nodeKey={isArr ? null : k}
                />
                {i < keys.length - 1 && (
                  <span className="text-[#d4d4d4]">,</span>
                )}
              </div>
            ))}
          </div>
        )}

        {!collapsed && (
          <span className="text-[#d4d4d4]">{isArr ? "]" : "}"}</span>
        )}
      </div>
    );
  }

  const valueClass =
    typeof data === "string"
      ? "text-[#CE9178]"
      : typeof data === "number"
        ? "text-[#B5CEA8]"
        : "text-[#569CD6]";

  return (
    <span>
      {nodeKey != null && (
        <span className="text-[#9CDCFE]">&quot;{nodeKey}&quot;: </span>
      )}
      <span className={valueClass}>{JSON.stringify(data)}</span>
    </span>
  );
}

export type JsonTreeViewerProps = {
  data: unknown;
  className?: string;
};

export default function JsonTreeViewer({
  data,
  className,
}: JsonTreeViewerProps) {
  let parsed: unknown = data;
  let parseError: string | null = null;

  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      parseError = e instanceof Error ? e.message : "Invalid JSON";
    }
  }

  if (parseError != null) {
    return (
      <pre className={cn("font-mono", className)}>
        <span className="text-red-400">Invalid JSON: {parseError}</span>
        {"\n"}
        {String(data)}
      </pre>
    );
  }

  return (
    <div className={cn("font-mono leading-[1.6]", className)}>
      <JsonNode data={parsed as JsonValue} />
    </div>
  );
}
