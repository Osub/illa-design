import { forwardRef } from "react"
import { SearchProps } from "./interface"
import { Input } from "./input"
import { LoadingIcon, SearchIcon } from "@illa-design/icon"
import { searchIconContainer } from "./style"

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (props, ref) => {
    const {
      loading,
      searchButton = <SearchIcon />,
      onSearch,
      ...otherProps
    } = props
    return (
      <Input
        ref={ref}
        prefix={
          <span
            css={searchIconContainer}
            onClick={() => {
              onSearch?.()
            }}
          >
            {loading ? <LoadingIcon spin={true} /> : searchButton}
          </span>
        }
        onPressEnter={() => {
          onSearch?.()
        }}
        {...otherProps}
      />
    )
  },
)

Search.displayName = "Search"
