(()=>{"use strict";var e={n:t=>{var i=t&&t.__esModule?()=>t.default:()=>t;return e.d(i,{a:i}),i},d:(t,i)=>{for(var a in i)e.o(i,a)&&!e.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:i[a]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.wp.element,i=window.React;var a=e.n(i);function n(e){const{startDate:i,endDate:a}=e;let n=i.weekday,l=i.day,s="";return a&&i.date!=a.date&&(n=`${i.weekday.substring(0,3)}-${a.weekday.substring(0,3)}`,l+=`-${parseInt(a.day)}`,s=" multiday"),(0,t.createElement)("div",{class:"civi-react-events-cell-date"},(0,t.createElement)("div",{class:"civi-react-events-weekday"},n),(0,t.createElement)("div",{class:"civi-react-events-day"+s},l))}function l(e){return(0,t.createElement)("div",{className:"civi-react-events-modal",onClick:e.closeModal},(0,t.createElement)("div",{className:"civi-react-events-modal-content"},(0,t.createElement)("h3",null,"Event Participants"),(0,t.createElement)("table",null,(0,t.createElement)("thead",null,(0,t.createElement)("tr",null,(0,t.createElement)("th",null,"Name"),(0,t.createElement)("th",null,"Attendee Role"),(0,t.createElement)("th",null,"Status"))),(0,t.createElement)("tbody",null,e.participants.map(((e,i)=>(0,t.createElement)("tr",null,(0,t.createElement)("td",null,e.name),(0,t.createElement)("td",null,e["role_id:label"]&&e["role_id:label"].join(", ")),(0,t.createElement)("td",null,e["status_id:label"]))))))))}function s(e){return(0,t.createElement)("div",{className:"civi-react-events-modal",onClick:e.closeModal},(0,t.createElement)("div",{className:"civi-react-events-modal-content"},(0,t.createElement)("div",{dangerouslySetInnerHTML:{__html:`${e.event.intro_text}\n                        <h3>${e.event.confirm_title}</h3>\n                        ${e.event.confirm_text}`}}),(0,t.createElement)("div",{className:"civi-react-events-button",onClick:t=>e.register(t,e.event.id)},"Register")))}class r extends a().Component{constructor(e){super(e),this.state={title:"Civi React Calendar",events:[],event_types:[],showFilter:!1,filters:{applied:{event_type:!1,registration:!1,event_full:!1},event_type:{},registration:{registered:!1,not_registered:!1},event_full:{available:!1,full:!1}},participantsList:void 0,eventToRegister:void 0},this.changeHandler=this.changeHandler.bind(this),this.closeParticipantsModal=this.closeParticipantsModal.bind(this),this.closeRegistrationModal=this.closeRegistrationModal.bind(this),this.registerForEvent=this.registerForEvent.bind(this),this.loadData=this.loadData.bind(this)}componentDidMount(){this.loadData()}loadData(){this.fetchEvents().then((e=>{const{events:t,event_types:i,user_status:a}=e,n=this.state.filters;i.forEach((e=>{e.value in n.event_type||(n.event_type[e.value]=!1)})),console.log("User status:",a),this.setState({events:t,event_types:i,filters:n,is_member:a.is_member,is_trail_leader:a.is_trail_leader,is_executive:a.is_executive})}))}fetchEvents=()=>new Promise(((e,t)=>{jQuery.post(my_ajax_object.ajax_url,{action:"civi_react_events",request:"event-list",data:"This is data passed to the backed"},(function(t){return e(JSON.parse(t))})).fail((function(e){return t(e)}))}));showEventParticipants=(e,t)=>{e.stopPropagation(),this.fetchParticipants(t).then((e=>{this.setState({participantsList:e})}))};fetchParticipants=e=>new Promise(((t,i)=>{const a={action:"civi_react_events",request:"participant-list",data:e};jQuery.post(my_ajax_object.ajax_url,a,(function(e){return t(JSON.parse(e))})).fail((function(e){return i(e)}))}));changeHandler(e){const{name:t,id:i,checked:a}=e.target,{filters:n}=this.state;n[t][i.toString()]=a,n.applied[t]=this.anyChecked(n[t]),this.setState({filters:n})}closeParticipantsModal(e){e.stopPropagation(),this.setState({participantsList:void 0})}registrationClickHandler(e,t){this.state.is_member?(e.stopPropagation(),this.setState({eventToRegister:t})):this.handleNavigate(t.registration_url)}closeRegistrationModal(e){e.stopPropagation(),this.setState({eventToRegister:void 0})}registerForEvent(e,t){const i={action:"civi_react_events",request:"register-for-event",data:t},a=this.loadData;jQuery.post(my_ajax_object.ajax_url,i,(function(e){console.log("Response:",e),a()})).fail((function(e){console.log("Could not register:",e)})),this.closeRegistrationModal(e)}deregisterFromEvent(e,t){const i={action:"civi_react_events",request:"deregister-from-event",data:t},a=this.loadData;jQuery.post(my_ajax_object.ajax_url,i,(function(e){console.log("Response:",e),a()})).fail((function(e){console.log("Could not deregister:",e)})),this.closeRegistrationModal(e)}anyChecked(e){let t=!1;return e&&Object.keys(e).forEach((i=>{t=t||e[i]})),t}handleNavigate(e,t){window.location.href=t}render(){const{event_types:e,events:i,showFilter:a,filters:r}=this.state;let c="";return(0,t.createElement)("div",{className:"civi-react-events"},this.state.participantsList?(0,t.createElement)(l,{closeModal:this.closeParticipantsModal,participants:this.state.participantsList}):"",this.state.eventToRegister?(0,t.createElement)(s,{event:this.state.eventToRegister,closeModal:this.closeRegistrationModal,register:this.registerForEvent}):"",(0,t.createElement)("div",{className:"civi-react-events-filter-block"},(0,t.createElement)("div",{className:"civi-react-events-button right",onClick:()=>this.setState({showFilter:!a})},a?"Hide Filters":"Show Filters"),(0,t.createElement)("div",{className:"civi-react-events-filters "+(a?"":"hide")},(0,t.createElement)("div",{className:"civi-react-events-filters-types"},e.map(((e,i)=>(0,t.createElement)(t.Fragment,null,(0,t.createElement)("input",{type:"checkbox",name:"event_type",id:e.value,onChange:this.changeHandler,checked:this.filters?.event_type[e.value]}),(0,t.createElement)("label",null,e.label),(0,t.createElement)("br",null))))),(0,t.createElement)("div",{className:"civi-react-events-filters-status"},(0,t.createElement)("input",{type:"checkbox",name:"registration",id:"registered",onChange:this.changeHandler}),(0,t.createElement)("label",null,"Registered"),(0,t.createElement)("br",null),(0,t.createElement)("input",{type:"checkbox",name:"registration",id:"not_registered",onChange:this.changeHandler}),(0,t.createElement)("label",null,"Not Registered"),(0,t.createElement)("br",null),(0,t.createElement)("input",{type:"checkbox",name:"event_full",id:"available",onChange:this.changeHandler}),(0,t.createElement)("label",null,"Available Events"),(0,t.createElement)("br",null),(0,t.createElement)("input",{type:"checkbox",name:"event_full",id:"full",onChange:this.changeHandler}),(0,t.createElement)("label",null,"Full Events"),(0,t.createElement)("br",null)))),i.map(((e,i)=>{if((!r.applied.event_type||r.event_type[e.event_type_id.toString()])&&(!r.applied.registration||r.registration[e.is_registered?"registered":"not_registered"])&&(!r.applied.event_full||r.event_full[e.is_full?"full":"available"])){const a=e["event_type_id:label"],l=e.is_online_registration&&(this.state.is_executive&&"AGM"==a||this.state.is_trail_leader&&("Member-Run"==a||"Open-Run"==a)),{start_date:s,end_date:r}=e;let M=!1;return s.month!=c&&(c=s.month,M=!0),(0,t.createElement)(t.Fragment,null,M&&(0,t.createElement)("h3",null,c),(0,t.createElement)("div",{index:i,type:e["event_type_id:label"],className:"civi-react-events-event",onClick:t=>this.handleNavigate(t,e.event_url)},(0,t.createElement)(n,{startDate:s,endDate:r}),(0,t.createElement)("div",{className:"civi-react-events-content-column"},(0,t.createElement)("div",{className:"civi-react-events-actions"},e.is_online_registration&&!e.is_full&&!e.is_registered&&(0,t.createElement)("div",{className:"civi-react-events-button",onClick:t=>this.registrationClickHandler(t,e)},"Register"),l&&(0,t.createElement)("img",{src:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA2LjMuMCBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyMyBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZD0iTTcyIDg4YTU2IDU2IDAgMSAxIDExMiAwQTU2IDU2IDAgMSAxIDcyIDg4ek02NCAyNDUuN0M1NCAyNTYuOSA0OCAyNzEuOCA0OCAyODhzNiAzMS4xIDE2IDQyLjNWMjQ1Ljd6bTE0NC40LTQ5LjNDMTc4LjcgMjIyLjcgMTYwIDI2MS4yIDE2MCAzMDRjMCAzNC4zIDEyIDY1LjggMzIgOTAuNVY0MTZjMCAxNy43LTE0LjMgMzItMzIgMzJIOTZjLTE3LjcgMC0zMi0xNC4zLTMyLTMyVjM4OS4yQzI2LjIgMzcxLjIgMCAzMzIuNyAwIDI4OGMwLTYxLjkgNTAuMS0xMTIgMTEyLTExMmgzMmMyNCAwIDQ2LjIgNy41IDY0LjQgMjAuM3pNNDQ4IDQxNlYzOTQuNWMyMC0yNC43IDMyLTU2LjIgMzItOTAuNWMwLTQyLjgtMTguNy04MS4zLTQ4LjQtMTA3LjdDNDQ5LjggMTgzLjUgNDcyIDE3NiA0OTYgMTc2aDMyYzYxLjkgMCAxMTIgNTAuMSAxMTIgMTEyYzAgNDQuNy0yNi4yIDgzLjItNjQgMTAxLjJWNDE2YzAgMTcuNy0xNC4zIDMyLTMyIDMySDQ4MGMtMTcuNyAwLTMyLTE0LjMtMzItMzJ6bTgtMzI4YTU2IDU2IDAgMSAxIDExMiAwQTU2IDU2IDAgMSAxIDQ1NiA4OHpNNTc2IDI0NS43djg0LjdjMTAtMTEuMyAxNi0yNi4xIDE2LTQyLjNzLTYtMzEuMS0xNi00Mi4zek0zMjAgMzJhNjQgNjQgMCAxIDEgMCAxMjggNjQgNjQgMCAxIDEgMC0xMjh6TTI0MCAzMDRjMCAxNi4yIDYgMzEgMTYgNDIuM1YyNjEuN2MtMTAgMTEuMy0xNiAyNi4xLTE2IDQyLjN6bTE0NC00Mi4zdjg0LjdjMTAtMTEuMyAxNi0yNi4xIDE2LTQyLjNzLTYtMzEuMS0xNi00Mi4zek00NDggMzA0YzAgNDQuNy0yNi4yIDgzLjItNjQgMTAxLjJWNDQ4YzAgMTcuNy0xNC4zIDMyLTMyIDMySDI4OGMtMTcuNyAwLTMyLTE0LjMtMzItMzJWNDA1LjJjLTM3LjgtMTgtNjQtNTYuNS02NC0xMDEuMmMwLTYxLjkgNTAuMS0xMTIgMTEyLTExMmgzMmM2MS45IDAgMTEyIDUwLjEgMTEyIDExMnoiLz48L3N2Zz4=",onClick:t=>this.showEventParticipants(t,e.id)}),e.is_registered&&(0,t.createElement)("img",{fill:"#b30000",src:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA2LjMuMCBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyMyBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZD0iTTE3MC41IDUxLjZMMTUxLjUgODBoMTQ1bC0xOS0yOC40Yy0xLjUtMi4yLTQtMy42LTYuNy0zLjZIMTc3LjFjLTIuNyAwLTUuMiAxLjMtNi43IDMuNnptMTQ3LTI2LjZMMzU0LjIgODBIMzY4aDQ4IDhjMTMuMyAwIDI0IDEwLjcgMjQgMjRzLTEwLjcgMjQtMjQgMjRoLThWNDMyYzAgNDQuMi0zNS44IDgwLTgwIDgwSDExMmMtNDQuMiAwLTgwLTM1LjgtODAtODBWMTI4SDI0Yy0xMy4zIDAtMjQtMTAuNy0yNC0yNFMxMC43IDgwIDI0IDgwaDhIODAgOTMuOGwzNi43LTU1LjFDMTQwLjkgOS40IDE1OC40IDAgMTc3LjEgMGg5My43YzE4LjcgMCAzNi4yIDkuNCA0Ni42IDI0Ljl6TTgwIDEyOFY0MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJIMzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjEyOEg4MHptODAgNjRWNDAwYzAgOC44LTcuMiAxNi0xNiAxNnMtMTYtNy4yLTE2LTE2VjE5MmMwLTguOCA3LjItMTYgMTYtMTZzMTYgNy4yIDE2IDE2em04MCAwVjQwMGMwIDguOC03LjIgMTYtMTYgMTZzLTE2LTcuMi0xNi0xNlYxOTJjMC04LjggNy4yLTE2IDE2LTE2czE2IDcuMiAxNiAxNnptODAgMFY0MDBjMCA4LjgtNy4yIDE2LTE2IDE2cy0xNi03LjItMTYtMTZWMTkyYzAtOC44IDcuMi0xNiAxNi0xNnMxNiA3LjIgMTYgMTZ6Ii8+PC9zdmc+",onClick:t=>this.deregisterFromEvent(t,e.id)})),(0,t.createElement)("div",{className:"civi-react-events-title"},e.title,e.is_online_registration&&(e.is_full?(0,t.createElement)("div",{className:"civi-react-events-pill full"},"Full"):(0,t.createElement)("div",{className:"civi-react-events-pill"},`${e.participants}/${e.max_participants}`)),e.is_registered&&(0,t.createElement)("div",{className:"civi-react-events-pill registered"},"Registered")),(0,t.createElement)("div",{className:"civi-react-events-description"},e.summary))))}})))}}const c=r,M=document.getElementById("civi-react-events");M&&(0,t.render)((0,t.createElement)(c,null),M)})();