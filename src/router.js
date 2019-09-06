import mapIndex from './components/mapIndex'
import start from './components/start'
const routers = [{
    path: '/mapIndex',
    name: 'mapIndex',
    component: mapIndex
}, {
    path: '/start',
    name: 'start',
    component: start
}, {
    path: '/',
    component: start
}]
export default routers