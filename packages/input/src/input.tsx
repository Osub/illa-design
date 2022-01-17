/** @jsxImportSource @emotion/react */
import * as React from "react"
import { ChangeEvent, forwardRef, useEffect, useState, useMemo } from "react"
import { InputProps, InputSize } from "./interface"
import { omit } from "@illa-design/system"
import {
  applyAddonCss,
  applyContainerCss,
  applyCountLimitStyle,
  applyInputContainer,
  applyLengthErrorStyle,
  applyPrefixCls,
} from "./style"
import { InputElement } from "./input-element"
import * as events from "events"

export interface StateValue {
  disabled?: boolean
  error?: boolean
  focus?: boolean
  variant?: string
  size?: InputSize
}

export const Input = forwardRef<HTMLDivElement, InputProps>((props, ref) => {

  const {
    allowClear,
    error,
    disabled,
    placeholder,
    maxLength,
    showCount,
    prefix,
    addonAfter,
    addonBefore,
    size = "medium",
    variant = "outline",
    ...rest
  } = props

  const otherProps = omit(rest, [
    "prefix",
    "suffix",
    "className",
    "defaultValue",
    "addonBefore",
    "addonAfter",
  ])

  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState("");
  const valueLength = value ? value.length : 0;
  let suffix = props.suffix

  const lengthError = useMemo(() => {
    if (maxLength) {
      return valueLength > maxLength;
    }
    return false;
  }, [valueLength, maxLength]);

  const stateValue = {
    error: error || lengthError,
    disabled,
    focus,
    variant,
    size,
  }

  if (maxLength && showCount) {
    suffix = (
      <span css={applyCountLimitStyle}>
        <span css={applyLengthErrorStyle(lengthError)}>{valueLength}</span>
        <span>/{maxLength}</span>
      </span>
    );
  }

  const onValueChange = (v: string, e: ChangeEvent<HTMLInputElement>) => {
    if (!('value' in props) || !props.value) {
      setValue(v);
    }
    props.onChange && props.onChange(e);
  };


  return <div ref={ref} {...otherProps}>
    <span css={applyContainerCss(variant)}>
      {addonBefore ? (<div css={applyAddonCss(stateValue)}>{addonBefore}</div> ): null}
      <span css={applyInputContainer(stateValue)}>
      {prefix ? (<span css={applyPrefixCls}>{prefix}</span> ): null}
        <InputElement
          {...props}
          onFocus={(e) => {
            setFocus(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            props.onBlur && props.onBlur(e);
          }}
          value={value}
          onValueChange={onValueChange}
        />
        {suffix ? (<span css={applyPrefixCls}>{suffix}</span> ): null}
      </span>
      {addonAfter ? (<div css={applyAddonCss(stateValue)}>{addonAfter}</div> ): null}
    </span>
  </div>

})
