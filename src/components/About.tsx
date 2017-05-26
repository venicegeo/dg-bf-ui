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

const styles: any = require('./About.css')
const brand: string = require('../images/brand-small.svg')

import * as React from 'react'
import {Modal} from './Modal'

interface Props {
  onDismiss()
}

export const About = ({ onDismiss }: Props) => (
  <Modal onDismiss={onDismiss} onInitialize={() => {/* noop */}}>
    <div className={styles.root}>
      <section className={styles.heading}>
        <img src={brand} alt="CoastLine"/>
        <h1>About CoastLine</h1>
      </section>
      <section className={styles.body}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa iusto
          neque perspiciatis praesentium. Aliquam consectetur consequatur, corporis
          dignissimos doloremque error ipsam, libero nostrum officiis quam quod rem
          sed, velit veniam.
        </p>
      </section>
    </div>
  </Modal>
)
