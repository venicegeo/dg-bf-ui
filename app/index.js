import 'font-awesome/css/font-awesome.css'
import './styles/layout.css'
import './styles/colors.css'
import './styles/typography.css'
import './styles/forms.css'
import './styles/menus.css'
import {bootstrap} from './router'

const root = document.createElement('div')
document.body.appendChild(root)
bootstrap(root)
