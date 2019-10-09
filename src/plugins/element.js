import Vue from "vue"
import { Button } from "element-ui"
import { Select } from "element-ui"
import { Option } from "element-ui"
import { Input } from "element-ui"
import { Message } from "element-ui"

Vue.use(Button)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
// Vue.use(Message);

Vue.prototype.$message = Message
