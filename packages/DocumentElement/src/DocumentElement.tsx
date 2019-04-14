import {
  CSSProperties,
  ReactNode,
  ReactElement,
  FunctionComponent,
} from 'react'
import withSideEffect from 'react-side-effect'
import { SimpleJSON, ExcludeKey } from '@c4605/ts-types'

export interface DocumentElementProps {
  className?: string
  style?: CSSProperties & SimpleJSON
  children?: ReactNode
}

export const _DocumentElementInner: FunctionComponent<DocumentElementProps> = ({
  children,
}) => (children || null) as ReactElement

function mergeClassNames(classNames: string[]) {
  const classNameSet = new Set(classNames.join(' ').split(' '))
  return Array.from(classNameSet)
    .filter(Boolean)
    .join(' ')
}

function reducePropsToState(
  propsList: DocumentElementProps[],
): Required<ExcludeKey<DocumentElementProps, 'children'>> {
  const mergedStyle = Object.assign({}, ...propsList.map(p => p.style || {}))
  const classNames = propsList.map(p => p.className || '')

  return {
    style: mergedStyle,
    className: mergeClassNames(classNames),
  }
}

function handleStateChangeOnClient(
  props: ReturnType<typeof reducePropsToState>,
) {
  const { documentElement } = document

  documentElement.style.cssText = ''
  if (props.style) {
    Object.assign(documentElement.style, props.style)
    Object.keys(props.style)
      .filter(k => k.startsWith('--'))
      .forEach(k => documentElement.style.setProperty(k, props.style![k]))
  }

  const nextClassName = props.className || ''
  if (nextClassName !== documentElement.className) {
    documentElement.className = nextClassName
  }
}

export const DocumentElement = withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient,
)(_DocumentElementInner)
