(()=>{var e={184:(e,t)=>{var n;!function(){"use strict";var r={}.hasOwnProperty;function a(){for(var e=[],t=0;t<arguments.length;t++){var n=arguments[t];if(n){var l=typeof n;if("string"===l||"number"===l)e.push(n);else if(Array.isArray(n)){if(n.length){var s=a.apply(null,n);s&&e.push(s)}}else if("object"===l){if(n.toString!==Object.prototype.toString&&!n.toString.toString().includes("[native code]")){e.push(n.toString());continue}for(var i in n)r.call(n,i)&&n[i]&&e.push(i)}}}return e.join(" ")}e.exports?(a.default=a,e.exports=a):void 0===(n=function(){return a}.apply(t,[]))||(e.exports=n)}()},251:(e,t,n)=>{"use strict";var r=n(196),a=Symbol.for("react.element"),l=(Symbol.for("react.fragment"),Object.prototype.hasOwnProperty),s=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,i={key:!0,ref:!0,__self:!0,__source:!0};t.jsx=function(e,t,n){var r,c={},o=null,u=null;for(r in void 0!==n&&(o=""+n),void 0!==t.key&&(o=""+t.key),void 0!==t.ref&&(u=t.ref),t)l.call(t,r)&&!i.hasOwnProperty(r)&&(c[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps)void 0===c[r]&&(c[r]=t[r]);return{$$typeof:a,type:e,key:o,ref:u,props:c,_owner:s.current}}},893:(e,t,n)=>{"use strict";e.exports=n(251)},196:e=>{"use strict";e.exports=window.React}},t={};function n(r){var a=t[r];if(void 0!==a)return a.exports;var l=t[r]={exports:{}};return e[r](l,l.exports,n),l.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";const e=window.wp.element;var t=n(196),r=n.n(t),a=n(184),l=n.n(a),s=n(893);const i=t.createContext({prefixes:{},breakpoints:["xxl","xl","lg","md","sm","xs"],minBreakpoint:"xs"}),{Consumer:c,Provider:o}=i;function u(e,n){const{prefixes:r}=(0,t.useContext)(i);return e||r[n]||n}function d(){const{breakpoints:e}=(0,t.useContext)(i);return e}function p(){const{minBreakpoint:e}=(0,t.useContext)(i);return e}const v=t.forwardRef((({bsPrefix:e,fluid:t,as:n="div",className:r,...a},i)=>{const c=u(e,"container"),o="string"==typeof t?`-${t}`:"-fluid";return(0,s.jsx)(n,{ref:i,...a,className:l()(r,t?`${c}${o}`:c)})}));v.displayName="Container",v.defaultProps={fluid:!1};const f=v,m=t.forwardRef((({bsPrefix:e,className:t,as:n="div",...r},a)=>{const i=u(e,"row"),c=d(),o=p(),v=`${i}-cols`,f=[];return c.forEach((e=>{const t=r[e];let n;delete r[e],null!=t&&"object"==typeof t?({cols:n}=t):n=t;const a=e!==o?`-${e}`:"";null!=n&&f.push(`${v}${a}-${n}`)})),(0,s.jsx)(n,{ref:a,...r,className:l()(t,i,...f)})}));m.displayName="Row";const h=m,y=t.forwardRef(((e,t)=>{const[{className:n,...r},{as:a="div",bsPrefix:i,spans:c}]=function({as:e,bsPrefix:t,className:n,...r}){t=u(t,"col");const a=d(),s=p(),i=[],c=[];return a.forEach((e=>{const n=r[e];let a,l,o;delete r[e],"object"==typeof n&&null!=n?({span:a,offset:l,order:o}=n):a=n;const u=e!==s?`-${e}`:"";a&&i.push(!0===a?`${t}${u}`:`${t}${u}-${a}`),null!=o&&c.push(`order${u}-${o}`),null!=l&&c.push(`offset${u}-${l}`)})),[{...r,className:l()(n,...i,...c)},{as:e,bsPrefix:t,spans:i}]}(e);return(0,s.jsx)(a,{...r,ref:t,className:l()(n,!c.length&&i)})}));y.displayName="Col";const _=y;function g(t){console.log("start date:",t.startDate),console.log("end date:",t.endDate);const{startDate:n,endDate:r}=t;let a=n.weekday,l=n.day,s="";return r&&n.date!=r.date&&(a=`${n.weekday.substring(0,3)}-${r.weekday.substring(0,3)}`,l+=`-${parseInt(r.day)}`,s=" multiday"),(0,e.createElement)("div",{class:"civi-react-events-cell-date"},(0,e.createElement)("div",{class:"civi-react-events-weekday"},a),(0,e.createElement)("div",{class:"civi-react-events-day"+s},l))}class E extends r().Component{constructor(e){super(e),this.state={title:"Civi React Calendar",events:[],event_types:[],showFilter:!1,filters:{}},this.changeHandler=this.changeHandler.bind(this)}componentDidMount(){this.loadData()}loadData(){this.fetchEvents().then((e=>{const{events:t,event_types:n}=e,r={applied:{event_type:!1,registration:!1,event_full:!1},event_type:{},registration:{registered:!1,not_registered:!1},event_full:{available:!1,full:!1}};n.forEach((e=>{r.event_type[e.value]=!1})),this.setState({events:t,event_types:n,filters:r})}))}fetchEvents=()=>new Promise(((e,t)=>{jQuery.post(my_ajax_object.ajax_url,{action:"civi_react_events",request:"event-list",data:"This is data passed to the backed"},(function(t){return e(JSON.parse(t))})).fail((function(e){return t(e)}))}));changeHandler(e){const{name:t,id:n,checked:r}=e.target,{filters:a}=this.state;a[t][n.toString()]=r,a.applied[t]=this.anyChecked(a[t]),this.setState({filters:a})}anyChecked(e){let t=!1;return e&&Object.keys(e).forEach((n=>{t=t||e[n]})),t}render(){const{event_types:t,events:n,showFilter:r,filters:a}=this.state;let l="";return(0,e.createElement)(f,null,(0,e.createElement)("div",{className:"civi-react-events-filters"},(0,e.createElement)("div",{className:"civi-react-events-button",onClick:()=>this.setState({showFilter:!r})},r?"Hide Filters":"Show Filters"),(0,e.createElement)(h,{style:r?{}:{display:"none"}},(0,e.createElement)(_,null,t.map(((t,n)=>(0,e.createElement)(e.Fragment,null,(0,e.createElement)("input",{type:"checkbox",name:"event_type",id:t.value,onChange:this.changeHandler,checked:this.filters?.event_type[t.value]}),(0,e.createElement)("label",null,t.label),(0,e.createElement)("br",null))))),(0,e.createElement)(_,null,(0,e.createElement)("input",{type:"checkbox",name:"registration",id:"registered",onChange:this.changeHandler}),(0,e.createElement)("label",null,"Registered"),(0,e.createElement)("br",null),(0,e.createElement)("input",{type:"checkbox",name:"registration",id:"not_registered",onChange:this.changeHandler}),(0,e.createElement)("label",null,"Not Registered"),(0,e.createElement)("br",null),(0,e.createElement)("input",{type:"checkbox",name:"event_full",id:"available",onChange:this.changeHandler}),(0,e.createElement)("label",null,"Available Events"),(0,e.createElement)("br",null),(0,e.createElement)("input",{type:"checkbox",name:"event_full",id:"full",onChange:this.changeHandler}),(0,e.createElement)("label",null,"Full Events"),(0,e.createElement)("br",null)))),n.map(((t,n)=>{if((!a.applied.event_type||a.event_type[t.event_type_id.toString()])&&(!a.applied.registration||a.registration[t.is_registered?"registered":"not_registered"])&&(!a.applied.event_full||a.event_full[t.is_full?"full":"available"])){const{start_date:r,end_date:a}=t;let s=!1;return r.month!=l&&(l=r.month,s=!0),(0,e.createElement)(e.Fragment,null,s&&(0,e.createElement)("h3",null,l),(0,e.createElement)(h,{index:n,type:t["event_type_id:label"],className:"civi-react-events-event"},(0,e.createElement)(_,{md:"auto"},(0,e.createElement)(g,{startDate:r,endDate:a})),(0,e.createElement)(_,null,t.is_online_registration&&!t.is_full&&!t.is_registered&&(0,e.createElement)("a",{href:t.registration_url},(0,e.createElement)("div",{className:"civi-react-events-button"},"Register")),(0,e.createElement)("div",{className:"civi-react-events-title"},(0,e.createElement)("a",{href:t.event_url},t.title),t.is_full&&(0,e.createElement)("div",{className:"civi-react-events-pill full"},"Full"),t.is_registered&&(0,e.createElement)("div",{className:"civi-react-events-pill registered"},"Registered")),(0,e.createElement)("div",{className:"civi-react-events-description"},t.summary))))}})))}}const b=E,x=document.getElementById("civi-react-events");x&&(0,e.render)((0,e.createElement)(b,null),x)})()})();