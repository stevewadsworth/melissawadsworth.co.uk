!function(){"use strict";function e(){}function t(e){return e()}function s(){return Object.create(null)}function n(e){e.forEach(t)}function l(e){return"function"==typeof e}function a(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function i(e,t){e.appendChild(t)}function r(e,t,s){e.insertBefore(t,s||null)}function o(e){e.parentNode.removeChild(e)}function c(e){return document.createElement(e)}function u(e){return document.createTextNode(e)}function p(){return u(" ")}function m(e,t,s){null==s?e.removeAttribute(t):e.getAttribute(t)!==s&&e.setAttribute(t,s)}function f(e,t){t=""+t,e.data!==t&&(e.data=t)}let d;function g(e){d=e}function v(e){(function(){if(!d)throw new Error("Function called outside component initialization");return d})().$$.on_mount.push(e)}const h=[],y=[],w=[],b=[],I=Promise.resolve();let $=!1;function x(e){w.push(e)}let C=!1;const k=new Set;function B(){if(!C){C=!0;do{for(let e=0;e<h.length;e+=1){const t=h[e];g(t),j(t.$$)}for(h.length=0;y.length;)y.pop()();for(let e=0;e<w.length;e+=1){const t=w[e];k.has(t)||(k.add(t),t())}w.length=0}while(h.length);for(;b.length;)b.pop()();$=!1,C=!1,k.clear()}}function j(e){if(null!==e.fragment){e.update(),n(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(x)}}const _=new Set;let L;function P(e,t){e&&e.i&&(_.delete(e),e.i(t))}function A(e,t,s,n){if(e&&e.o){if(_.has(e))return;_.add(e),L.c.push(()=>{_.delete(e),n&&(s&&e.d(1),n())}),e.o(t)}}function T(e,s,a){const{fragment:i,on_mount:r,on_destroy:o,after_update:c}=e.$$;i&&i.m(s,a),x(()=>{const s=r.map(t).filter(l);o?o.push(...s):n(s),e.$$.on_mount=[]}),c.forEach(x)}function D(e,t){const s=e.$$;null!==s.fragment&&(n(s.on_destroy),s.fragment&&s.fragment.d(t),s.on_destroy=s.fragment=null,s.ctx=[])}function G(e,t){-1===e.$$.dirty[0]&&(h.push(e),$||($=!0,I.then(B)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function R(t,l,a,i,r,c,u=[-1]){const p=d;g(t);const m=l.props||{},f=t.$$={fragment:null,ctx:null,props:c,update:e,not_equal:r,bound:s(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:s(),dirty:u};let v=!1;if(f.ctx=a?a(t,m,(e,s,...n)=>{const l=n.length?n[0]:s;return f.ctx&&r(f.ctx[e],f.ctx[e]=l)&&(f.bound[e]&&f.bound[e](l),v&&G(t,e)),s}):[],f.update(),v=!0,n(f.before_update),f.fragment=!!i&&i(f.ctx),l.target){if(l.hydrate){const e=function(e){return Array.from(e.childNodes)}(l.target);f.fragment&&f.fragment.l(e),e.forEach(o)}else f.fragment&&f.fragment.c();l.intro&&P(t.$$.fragment),T(t,l.target,l.anchor),B()}g(p)}class S{$destroy(){D(this,1),this.$destroy=e}$on(e,t){const s=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return s.push(t),()=>{const e=s.indexOf(t);-1!==e&&s.splice(e,1)}}$set(){}}function W(t){let s,n,l,a,d,g;return{c(){s=c("p"),n=c("i"),l=p(),a=c("a"),d=u(t[0]),m(n,"class","fas fa-map-marker-alt"),m(a,"href",g="https://www.google.com/maps/search/?api=1&query="+t[1]),m(s,"class","svelte-1o31iu1")},m(e,t){r(e,s,t),i(s,n),i(s,l),i(s,a),i(a,d)},p(e,[t]){1&t&&f(d,e[0])},i:e,o:e,d(e){e&&o(s)}}}function z(e,t,s){let{location:n=""}=t,l=encodeURI(n);return e.$set=e=>{"location"in e&&s(0,n=e.location)},[n,l]}class E extends S{constructor(e){super(),R(this,e,z,W,a,{location:0})}}function H(e,t,s){const n=e.slice();return n[3]=t[s],n}function U(e){let t,s=e[3].title+"";return{c(){t=u(s)},m(e,s){r(e,t,s)},p(e,n){1&n&&s!==(s=e[3].title+"")&&f(t,s)},d(e){e&&o(t)}}}function q(e){let t,s,n,l=e[3].title+"";return{c(){t=c("a"),s=u(l),m(t,"href",n=e[3].url)},m(e,n){r(e,t,n),i(t,s)},p(e,a){1&a&&l!==(l=e[3].title+"")&&f(s,l),1&a&&n!==(n=e[3].url)&&m(t,"href",n)},d(e){e&&o(t)}}}function M(e){let t,s,n,l,a,d,g,v,h,y,w,b,I,$,x,C=e[3].start+"",k=e[3].end+"",B=e[3].description+"";function j(e,t){return e[3].url?q:U}let _=j(e),L=_(e);const G=new E({props:{location:e[3].location}});return{c(){var e;t=c("li"),s=c("span"),n=c("p"),l=u(C),a=c("br"),d=u(k),g=p(),v=c("span"),h=c("h3"),L.c(),y=p(),w=c("p"),b=u(B),I=p(),(e=G.$$.fragment)&&e.c(),$=p(),m(n,"class","svelte-1kojbyi"),m(s,"class","exhibitionsDate svelte-1kojbyi"),m(h,"class","svelte-1kojbyi"),m(w,"class","svelte-1kojbyi"),m(v,"class","exhibitionsDescription svelte-1kojbyi"),m(t,"class","svelte-1kojbyi")},m(e,o){r(e,t,o),i(t,s),i(s,n),i(n,l),i(n,a),i(n,d),i(t,g),i(t,v),i(v,h),L.m(h,null),i(v,y),i(v,w),i(w,b),i(v,I),T(G,v,null),i(t,$),x=!0},p(e,t){(!x||1&t)&&C!==(C=e[3].start+"")&&f(l,C),(!x||1&t)&&k!==(k=e[3].end+"")&&f(d,k),_===(_=j(e))&&L?L.p(e,t):(L.d(1),L=_(e),L&&(L.c(),L.m(h,null))),(!x||1&t)&&B!==(B=e[3].description+"")&&f(b,B);const s={};1&t&&(s.location=e[3].location),G.$set(s)},i(e){x||(P(G.$$.fragment,e),x=!0)},o(e){A(G.$$.fragment,e),x=!1},d(e){e&&o(t),L.d(),D(G)}}}function N(e){let t,s,l,a,d,g,v,h,y=e[1].title+"",w=e[1].description+"",b=e[0],I=[];for(let t=0;t<b.length;t+=1)I[t]=M(H(e,b,t));const $=e=>A(I[e],1,1,()=>{I[e]=null});return{c(){t=c("h2"),s=u(y),l=p(),a=c("p"),d=u(w),g=p(),v=c("ul");for(let e=0;e<I.length;e+=1)I[e].c();m(a,"class","svelte-1kojbyi"),m(v,"class","svelte-1kojbyi")},m(e,n){r(e,t,n),i(t,s),r(e,l,n),r(e,a,n),i(a,d),r(e,g,n),r(e,v,n);for(let e=0;e<I.length;e+=1)I[e].m(v,null);h=!0},p(e,[t]){if((!h||2&t)&&y!==(y=e[1].title+"")&&f(s,y),(!h||2&t)&&w!==(w=e[1].description+"")&&f(d,w),1&t){let s;for(b=e[0],s=0;s<b.length;s+=1){const n=H(e,b,s);I[s]?(I[s].p(n,t),P(I[s],1)):(I[s]=M(n),I[s].c(),P(I[s],1),I[s].m(v,null))}for(L={r:0,c:[],p:L},s=b.length;s<I.length;s+=1)$(s);L.r||n(L.c),L=L.p}},i(e){if(!h){for(let e=0;e<b.length;e+=1)P(I[e]);h=!0}},o(e){I=I.filter(Boolean);for(let e=0;e<I.length;e+=1)A(I[e]);h=!1},d(e){e&&o(t),e&&o(l),e&&o(a),e&&o(g),e&&o(v),function(e,t){for(let s=0;s<e.length;s+=1)e[s]&&e[s].d(t)}(I,e)}}}function V(e,t,s){let{apiURL:n}=t,l=[],a={title:"",description:"",events:[]};return v((async function(){const e=await fetch(n);s(1,a=await e.json()),s(0,l=a.events)})),e.$set=e=>{"apiURL"in e&&s(2,n=e.apiURL)},[l,a,n]}function O(t){let s,n,l;return{c(){s=c("h2"),s.textContent="Contact",n=p(),l=c("ul"),l.innerHTML='<li><span><i class="fas fa-phone"></i> \n            <a href="tel:+447966417196">+44 (0) 7966 417196</a></span></li> \n    <li><span><i class="fas fa-envelope"></i> \n            <a href="mailto:info@melissawadsworth.co.uk">info@melissawadsworth.co.uk</a></span></li> \n    <li><span><i class="fab fa-instagram"></i> \n            <a href="https://www.instagram.com/melissa_wadsworth_artist/">melissa_wadsworth_artist</a></span></li>',m(l,"class","svelte-12euhve")},m(e,t){r(e,s,t),r(e,n,t),r(e,l,t)},p:e,i:e,o:e,d(e){e&&o(s),e&&o(n),e&&o(l)}}}function F(t){let s,n,l;return{c(){s=c("h2"),s.textContent="About",n=p(),l=c("article"),l.innerHTML="<p>Melissa Wadsworth is an artist based in the Wiltshire city of Salisbury. Her work often depicts scenes and people from  Salisbury and the surrounding countryside.</p> \n    <p>Melissa studied at the University of Central England in Birmingham and gained a degree in Ceramics and Glass. After graduating she worked in ceramics before taking a career break to raise a family. Now returning to Art, she finds herself drawn to painting and drawing.</p>"},m(e,t){r(e,s,t),r(e,n,t),r(e,l,t)},p:e,i:e,o:e,d(e){e&&o(s),e&&o(n),e&&o(l)}}}function J(t){let s,n,l;return{c(){s=c("h2"),s.textContent="Gallery",n=p(),l=c("div"),l.innerHTML='<button class="galleryButtonText galleryButtonTextLeft svelte-11sew8m" onclick="moveGallery(1)"><span class="fas fa-chevron-left"></span> Previous</button> \n    <button class="galleryButtonText galleryButtonTextRight svelte-11sew8m" onclick="moveGallery(-1)">Next <span class="fas fa-chevron-right"></span></button> \n    <button id="leftButton" class="galleryButton galleryButtonLeft svelte-11sew8m" onclick="moveGallery(-1)" title="previous"><span class="fas fa-chevron-left"></span></button> \n    <ul id="galleryList" class="galleryList svelte-11sew8m"><li class="galleryItem galleryItemVisible svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Bunting.jpeg" alt="Bunting, Acrylic on canvas, 2019"> \n        <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Bunting</p> \n            <p class="svelte-11sew8m">Acrylic on canvas</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n    <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Coombe-Bissett-III.jpeg" alt="Coombe Bissett Barn III, Charcoal on paper, 2019"> \n        <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Coombe Bissett Barn III</p> \n            <p class="svelte-11sew8m">Charcoal on paper</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n    <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Portrait-of-a-Woman-II.jpeg" alt="Portrait of a Woman II, Gouache, 2019"> \n        <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Portrait of a Woman II</p> \n            <p class="svelte-11sew8m">Gouache</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n    <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Hill-and-Vale.jpeg" alt="Hill and Vale, Charcoal on paper, 2019"> \n        <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Hill and Vale</p> \n            <p class="svelte-11sew8m">Charcoal on paper</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n    <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Trees.jpeg" alt="Trees, Acrylic on canvas, 2019"> \n        <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Trees</p> \n            <p class="svelte-11sew8m">Acrylic on canvas</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n    <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Portraits-of-Lizzy.jpeg" alt="Portraits of Lizzy, Pencil on paper, 2019"> \n            <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Portraits of Lizzy</p> \n            <p class="svelte-11sew8m">Pencil on paper</p> \n            <p class="svelte-11sew8m">2019</p></div></div></li> \n        <li class="galleryItem svelte-11sew8m"><div class="galleryItemContainer svelte-11sew8m"><img class="galleryImage svelte-11sew8m" src="images/Portrait-of-a-Woman-I.jpeg" alt="Portrait of a Woman I, Pencil on paper, 2019"> \n            <div class="galleryDescription svelte-11sew8m"><p class="svelte-11sew8m">Woman</p> \n                <p class="svelte-11sew8m">Pencil on paper</p> \n                <p class="svelte-11sew8m">2019</p></div></div></li></ul> \n    <button id="rightButton" class="galleryButton galleryButtonRight svelte-11sew8m" onclick="moveGallery(1)" title="next"><span class="fas fa-chevron-right"></span></button>',m(l,"class","galleryContainer svelte-11sew8m")},m(e,t){r(e,s,t),r(e,n,t),r(e,l,t)},p:e,i:e,o:e,d(e){e&&o(s),e&&o(n),e&&o(l)}}}new class extends S{constructor(e){super(),R(this,e,V,N,a,{apiURL:2})}}({target:document.querySelector("#exhibitions"),props:{apiURL:"events.json"}}),new class extends S{constructor(e){super(),R(this,e,null,O,a,{})}}({target:document.querySelector("#contact")}),new class extends S{constructor(e){super(),R(this,e,null,F,a,{})}}({target:document.querySelector("#about")}),new class extends S{constructor(e){super(),R(this,e,null,J,a,{})}}({target:document.querySelector("#gallery")})}();
//# sourceMappingURL=svelte-bundle.js.map
