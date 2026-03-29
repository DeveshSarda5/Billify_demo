"use client";

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RiveInput = {
  name: string;
  value?: number | boolean;
  fire?: () => void;
};

type DirectionalRiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  stateMachineName?: string;
  hoverLeftInputName?: string;
  hoverRightInputName?: string;
  idleInputNames?: string[];
  src?: string;
};

type HoverDirection = "left" | "right";

const DEFAULT_RIVE_SRC = "/assets/cat-button.riv";
const DEFAULT_STATE_MACHINE = "State Machine 1";
const DEFAULT_IDLE_INPUT_NAMES = ["idle", "Idle", "reset", "Reset", "toIdle", "ToIdle"];

const layout = new Layout({
  fit: Fit.Cover,
  alignment: Alignment.Center,
});

const RIVE_HEADER = [0x52, 0x49, 0x56, 0x45];

function setInputState(input: RiveInput | null | undefined, active: boolean) {
  if (!input) {
    return;
  }

  if (typeof input.value === "boolean") {
    input.value = active;
    return;
  }

  if (active && typeof input.fire === "function") {
    input.fire();
  }
}

function getInputMap(rive: { stateMachineInputs: (name: string) => RiveInput[] } | null, stateMachineName: string) {
  const inputs = new Map<string, RiveInput>();

  if (!rive) {
    return inputs;
  }

  for (const input of rive.stateMachineInputs(stateMachineName) ?? []) {
    inputs.set(input.name, input);
  }

  return inputs;
}

function findMatchingName(names: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());

  for (const name of names) {
    if (normalizedCandidates.includes(name.toLowerCase())) {
      return name;
    }
  }

  for (const name of names) {
    const normalizedName = name.toLowerCase();

    if (normalizedCandidates.some((candidate) => normalizedName.includes(candidate))) {
      return name;
    }
  }

  return null;
}

function stopAllPlayback(rive: {
  stop: (animationNames?: string | string[]) => void;
  playingAnimationNames?: string[];
  playingStateMachineNames?: string[];
}) {
  if (rive.playingAnimationNames?.length) {
    rive.stop(rive.playingAnimationNames);
  }

  if (rive.playingStateMachineNames?.length) {
    rive.stop(rive.playingStateMachineNames);
  }
}

function FallbackHoverLayer({
  direction,
  hovered,
}: {
  direction: HoverDirection;
  hovered: boolean;
}) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
      <span
        className={[
          "absolute inset-y-[-55%] w-32 rounded-full bg-[#f5b546]/45 blur-2xl transition-all duration-300 ease-out",
          direction === "left" ? "left-[-5.5rem]" : "right-[-5.5rem]",
          hovered
            ? direction === "left"
              ? "translate-x-[6.4rem] scale-110 opacity-100"
              : "-translate-x-[6.4rem] scale-110 opacity-100"
            : direction === "left"
              ? "translate-x-0 scale-90 opacity-0"
              : "translate-x-0 scale-90 opacity-0",
        ].join(" ")}
      />
      <span
        className={[
          "absolute inset-y-[18%] w-24 rounded-full bg-white/18 blur-xl transition-all duration-300 ease-out",
          direction === "left" ? "left-[-3rem]" : "right-[-3rem]",
          hovered
            ? direction === "left"
              ? "translate-x-[4.8rem] opacity-100"
              : "-translate-x-[4.8rem] opacity-100"
            : "opacity-0",
        ].join(" ")}
      />
      <span
        className={[
          "absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,transparent,rgba(245,181,70,0.16),transparent)] transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </span>
  );
}

export default function DirectionalRiveButton({
  children,
  className = "",
  disabled,
  hoverLeftInputName = "hoverLeft",
  hoverRightInputName = "hoverRight",
  idleInputNames = DEFAULT_IDLE_INPUT_NAMES,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  src = DEFAULT_RIVE_SRC,
  stateMachineName = DEFAULT_STATE_MACHINE,
  type = "button",
  ...buttonProps
}: DirectionalRiveButtonProps) {
  const inputMapRef = useRef<Map<string, RiveInput>>(new Map());
  const activeStateMachineNameRef = useRef<string | null>(null);
  const animationNamesRef = useRef<{ idle: string | null; left: string | null; right: string | null }>({
    idle: null,
    left: null,
    right: null,
  });
  const [assetStatus, setAssetStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [hoverDirection, setHoverDirection] = useState<HoverDirection>("left");
  const [isFallbackHovered, setIsFallbackHovered] = useState(false);
  const [isRiveHovered, setIsRiveHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function validateAsset() {
      try {
        const response = await fetch(src, { cache: "no-store" });

        if (!response.ok) {
          if (!cancelled) {
            setAssetStatus("missing");
          }
          return;
        }

        const buffer = await response.arrayBuffer();
        const header = new Uint8Array(buffer.slice(0, 4));
        const isRiveHeader = RIVE_HEADER.every((value, index) => header[index] === value);

        if (!cancelled) {
          setAssetStatus(isRiveHeader ? "ready" : "missing");
        }
      } catch {
        if (!cancelled) {
          setAssetStatus("missing");
        }
      }
    }

    setAssetStatus("loading");
    void validateAsset();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const riveConfig = useMemo(
    () => ({
      src: assetStatus === "ready" ? src : undefined,
      autoplay: false,
      layout,
    }),
    [assetStatus, src],
  );

  const { rive, RiveComponent } = useRive(
    riveConfig,
    {
      shouldResizeCanvasToContainer: true,
    },
  );

  useEffect(() => {
    if (!rive || assetStatus !== "ready") {
      inputMapRef.current = new Map();
      activeStateMachineNameRef.current = null;
      animationNamesRef.current = { idle: null, left: null, right: null };
      return;
    }

    const availableStateMachines = rive.stateMachineNames ?? [];
    const availableAnimations = rive.animationNames ?? [];
    const activeStateMachineName = availableStateMachines.includes(stateMachineName)
      ? stateMachineName
      : availableStateMachines[0] ?? null;

    activeStateMachineNameRef.current = activeStateMachineName;
    inputMapRef.current = activeStateMachineName ? getInputMap(rive, activeStateMachineName) : new Map();
    animationNamesRef.current = {
      idle: findMatchingName(availableAnimations, ["idle", "default", "loop", "rest", "get started"]) ?? availableAnimations[0] ?? null,
      left: findMatchingName(availableAnimations, ["hoverleft", "left", "leftpaw", "l_paw", "lpaw"]),
      right: findMatchingName(availableAnimations, ["hoverright", "right", "rightpaw", "r_paw", "rpaw"]),
    };

    stopAllPlayback(rive);
  }, [assetStatus, rive, stateMachineName]);

  const resetToIdle = useCallback(() => {
    const inputs = inputMapRef.current;
    const activeStateMachineName = activeStateMachineNameRef.current;

    setIsRiveHovered(false);

    setInputState(inputs.get(hoverLeftInputName), false);
    setInputState(inputs.get(hoverRightInputName), false);

    for (const inputName of idleInputNames) {
      const input = inputs.get(inputName);

      if (!input) {
        continue;
      }

      setInputState(input, true);

      if (typeof input.value === "boolean") {
        input.value = false;
      }

      break;
    }

    if (rive) {
      stopAllPlayback(rive);
    }

    if (!activeStateMachineName && rive && animationNamesRef.current.idle) {
      stopAllPlayback(rive);
      rive.play(animationNamesRef.current.idle, true);
    }
  }, [hoverLeftInputName, hoverRightInputName, idleInputNames, rive]);

  const triggerHoverFromDirection = useCallback(
    (direction: "left" | "right") => {
      const inputs = inputMapRef.current;
      const leftInput = inputs.get(hoverLeftInputName);
      const rightInput = inputs.get(hoverRightInputName);
      const directionalAnimation = direction === "left" ? animationNamesRef.current.left : animationNamesRef.current.right;
      const activeStateMachineName = activeStateMachineNameRef.current;

      setIsRiveHovered(true);

      setInputState(leftInput, false);
      setInputState(rightInput, false);

      if (rive && directionalAnimation) {
        stopAllPlayback(rive);
        rive.play(directionalAnimation, true);
        return;
      }

      if (activeStateMachineName && rive) {
        stopAllPlayback(rive);
        rive.play(activeStateMachineName, true);
      }

      if (leftInput || rightInput) {
        setInputState(direction === "left" ? leftInput : rightInput, true);
        return;
      }
    },
    [hoverLeftInputName, hoverRightInputName, rive],
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(event);

      const rect = event.currentTarget.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const direction = relativeX <= rect.width / 2 ? "left" : "right";

      setHoverDirection(direction);
      setIsFallbackHovered(true);
      triggerHoverFromDirection(direction);
    },
    [onMouseEnter, triggerHoverFromDirection],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      setIsFallbackHovered(false);
      resetToIdle();
    },
    [onMouseLeave, resetToIdle],
  );

  const handleBlur = useCallback<NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["onBlur"]>>(
    (event) => {
      onBlur?.(event);
      setIsFallbackHovered(false);
      resetToIdle();
    },
    [onBlur, resetToIdle],
  );

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={(event) => {
        onFocus?.(event);
        setHoverDirection("left");
        setIsFallbackHovered(true);
        triggerHoverFromDirection("left");
      }}
      className={[
        "relative isolate flex w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#f5b546] bg-[#171717] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(15,23,42,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b546]/60",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      {assetStatus === "ready" ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-0 overflow-hidden rounded-[inherit]">
          <span
            className={[
              "absolute inset-0 transition-opacity duration-200",
              isRiveHovered ? "opacity-90" : "opacity-0",
            ].join(" ")}
            style={{
              mixBlendMode: "screen",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,1) 76%, rgba(0,0,0,1) 100%)",
              maskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,1) 76%, rgba(0,0,0,1) 100%)",
              transform: "scale(1.12)",
            }}
          >
            <RiveComponent className="h-full w-full" />
          </span>
          <span className="absolute inset-y-0 left-[16%] right-[16%] rounded-full bg-[#171717]" />
          <span className="absolute inset-y-[14%] left-[22%] right-[22%] rounded-full bg-[#171717]/96 blur-sm" />
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] z-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]"
      />
      <FallbackHoverLayer direction={hoverDirection} hovered={isFallbackHovered} />
      <span className="relative z-10 flex items-center justify-center tracking-[0.02em]">{children}</span>
    </button>
  );
}
