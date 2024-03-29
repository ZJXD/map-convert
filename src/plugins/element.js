import Vue from 'vue'
import { Button } from 'element-ui'
import { Select } from 'element-ui'
import { Option } from 'element-ui'
import { Input } from 'element-ui'
import { Form } from 'element-ui'
import { FormItem } from 'element-ui'
import { Menu, MenuItem } from 'element-ui'
import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Menu)
Vue.use(MenuItem)
// Vue.use(Message);

Vue.prototype.$message = Message
