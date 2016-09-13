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

const styles: any = require('./LoadingAnimation.css')

import * as React from 'react'

interface Props {
  className?: string
}

export const LoadingAnimation = ({className}: Props) => (
  <svg viewBox="0 0 100 100" className={`${styles.root} ${className || ''}`}>
    <path className={styles.waveDistant} d="M200,55 C175,55 175,35 150,35 C125,35 125,55 100,55 C75,55 75,35 50,35 C25,35 25,55 -2.66453527e-15,55 L-2.66453526e-15,100 L200,100"/>
    <path className={styles.waveClose} d="M100,55 C75,55 75,35 50,35 C25,35 25,55 8.52651283e-14,55 C-25,55 -25,35 -50,35 C-75,35 -75,55 -100,55 L-100,100 L100,100"/>
  </svg>
)
