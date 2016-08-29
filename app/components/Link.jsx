/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'

export const Link = ({
  activeClassName,
  children,
  className,
  isActive,
  pathname,
  search = '',
  hash = '',
  title,
  onClick,
}) => (
  <a
    href={pathname + search + hash}
    className={`${className} ${isActive === true || (typeof isActive === 'undefined' && location.pathname === pathname) ? activeClassName : ''}`}
    title={title}
    onClick={event => {
      event.preventDefault()
      return onClick({ pathname, search, hash })
    }}
    >
    {children}
  </a>
)

Link.propTypes = {
  activeClassName: React.PropTypes.string,
  children: React.PropTypes.any,
  className: React.PropTypes.string,
  hash: React.PropTypes.string,
  isActive: React.PropTypes.bool,
  pathname: React.PropTypes.string,
  search: React.PropTypes.string,
  title: React.PropTypes.string,
  onClick: React.PropTypes.func,
}
