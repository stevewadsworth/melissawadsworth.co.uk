
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/events/Location.svelte generated by Svelte v3.20.1 */

    const file = "src/events/Location.svelte";

    function create_fragment(ctx) {
    	let p;
    	let i;
    	let t0;
    	let a;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t0 = space();
    			a = element("a");
    			t1 = text(/*location*/ ctx[0]);
    			attr_dev(i, "class", "fas fa-map-marker-alt");
    			add_location(i, file, 6, 3, 96);
    			attr_dev(a, "href", a_href_value = "https://www.google.com/maps/search/?api=1&query=" + /*encodedLoc*/ ctx[1]);
    			add_location(a, file, 6, 41, 134);
    			attr_dev(p, "class", "svelte-1o31iu1");
    			add_location(p, file, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*location*/ 1) set_data_dev(t1, /*location*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { location = "" } = $$props;
    	let encodedLoc = encodeURI(location);
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Location> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Location", $$slots, []);

    	$$self.$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({ location, encodedLoc });

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("encodedLoc" in $$props) $$invalidate(1, encodedLoc = $$props.encodedLoc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location, encodedLoc];
    }

    class Location extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Location",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get location() {
    		throw new Error("<Location>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Location>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/events/Events.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/events/Events.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (33:20) {:else}
    function create_else_block(ctx) {
    	let t_value = /*item*/ ctx[3].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 2 && t_value !== (t_value = /*item*/ ctx[3].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(33:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (31:20) {#if item.url}
    function create_if_block(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[3].title + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[3].url);
    			add_location(a, file$1, 31, 24, 738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 2 && t_value !== (t_value = /*item*/ ctx[3].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*events*/ 2 && a_href_value !== (a_href_value = /*item*/ ctx[3].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:20) {#if item.url}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#each events as item }
    function create_each_block(ctx) {
    	let li;
    	let span0;
    	let p0;
    	let t0_value = /*item*/ ctx[3].start + "";
    	let t0;
    	let br;
    	let t1_value = /*item*/ ctx[3].end + "";
    	let t1;
    	let t2;
    	let span1;
    	let h3;
    	let t3;
    	let p1;
    	let t4_value = /*item*/ ctx[3].description + "";
    	let t4;
    	let t5;
    	let t6;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[3].url) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const location = new Location({
    			props: { location: /*item*/ ctx[3].location },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			span0 = element("span");
    			p0 = element("p");
    			t0 = text(t0_value);
    			br = element("br");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			h3 = element("h3");
    			if_block.c();
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			create_component(location.$$.fragment);
    			t6 = space();
    			add_location(br, file$1, 26, 31, 569);
    			attr_dev(p0, "class", "svelte-1kojbyi");
    			add_location(p0, file$1, 26, 16, 554);
    			attr_dev(span0, "class", "exhibitionsDate svelte-1kojbyi");
    			add_location(span0, file$1, 25, 12, 507);
    			attr_dev(h3, "class", "svelte-1kojbyi");
    			add_location(h3, file$1, 29, 16, 674);
    			attr_dev(p1, "class", "svelte-1kojbyi");
    			add_location(p1, file$1, 36, 16, 903);
    			attr_dev(span1, "class", "exhibitionsDescription svelte-1kojbyi");
    			add_location(span1, file$1, 28, 12, 620);
    			attr_dev(li, "class", "svelte-1kojbyi");
    			add_location(li, file$1, 24, 8, 490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span0);
    			append_dev(span0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br);
    			append_dev(p0, t1);
    			append_dev(li, t2);
    			append_dev(li, span1);
    			append_dev(span1, h3);
    			if_block.m(h3, null);
    			append_dev(span1, t3);
    			append_dev(span1, p1);
    			append_dev(p1, t4);
    			append_dev(span1, t5);
    			mount_component(location, span1, null);
    			append_dev(li, t6);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*events*/ 2) && t0_value !== (t0_value = /*item*/ ctx[3].start + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*events*/ 2) && t1_value !== (t1_value = /*item*/ ctx[3].end + "")) set_data_dev(t1, t1_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			}

    			if ((!current || dirty & /*events*/ 2) && t4_value !== (t4_value = /*item*/ ctx[3].description + "")) set_data_dev(t4, t4_value);
    			const location_changes = {};
    			if (dirty & /*events*/ 2) location_changes.location = /*item*/ ctx[3].location;
    			location.$set(location_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(location.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(location.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    			destroy_component(location);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:4) {#each events as item }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h2;
    	let t0_value = /*data*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*data*/ ctx[0].description + "";
    	let t2;
    	let t3;
    	let ul;
    	let current;
    	let each_value = /*events*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$1, 20, 0, 401);
    			attr_dev(p, "class", "svelte-1kojbyi");
    			add_location(p, file$1, 21, 0, 423);
    			attr_dev(ul, "class", "svelte-1kojbyi");
    			add_location(ul, file$1, 22, 0, 449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*data*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data*/ 1) && t2_value !== (t2_value = /*data*/ ctx[0].description + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*events*/ 2) {
    				each_value = /*events*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { url } = $$props;
    	let { data = { title: "", description: "", events: [] } } = $$props;
    	let events = data.events;

    	onMount(async function () {
    		const response = await fetch(url);
    		$$invalidate(0, data = await response.json());
    		$$invalidate(1, events = data.events);
    	});

    	const writable_props = ["url", "data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Events> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Events", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(2, url = $$props.url);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ onMount, Location, url, data, events });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(2, url = $$props.url);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("events" in $$props) $$invalidate(1, events = $$props.events);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, events, url];
    }

    class Events extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { url: 2, data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Events",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*url*/ ctx[2] === undefined && !("url" in props)) {
    			console.warn("<Events> was created without expected prop 'url'");
    		}
    	}

    	get url() {
    		throw new Error("<Events>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Events>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Events>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Events>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ContactDetails.svelte generated by Svelte v3.20.1 */

    const file$2 = "src/ContactDetails.svelte";

    function create_fragment$2(ctx) {
    	let h2;
    	let t1;
    	let ul;
    	let li0;
    	let span0;
    	let i0;
    	let t2;
    	let a0;
    	let t4;
    	let li1;
    	let span1;
    	let i1;
    	let t5;
    	let a1;
    	let t7;
    	let li2;
    	let span2;
    	let i2;
    	let t8;
    	let a2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Contact";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			span0 = element("span");
    			i0 = element("i");
    			t2 = space();
    			a0 = element("a");
    			a0.textContent = "+44 (0) 7966 417196";
    			t4 = space();
    			li1 = element("li");
    			span1 = element("span");
    			i1 = element("i");
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "info@melissawadsworth.co.uk";
    			t7 = space();
    			li2 = element("li");
    			span2 = element("span");
    			i2 = element("i");
    			t8 = space();
    			a2 = element("a");
    			a2.textContent = "melissa_wadsworth_artist";
    			add_location(h2, file$2, 0, 0, 0);
    			attr_dev(i0, "class", "fas fa-phone");
    			add_location(i0, file$2, 4, 12, 58);
    			attr_dev(a0, "href", "tel:+447966417196");
    			add_location(a0, file$2, 5, 12, 99);
    			add_location(span0, file$2, 3, 8, 39);
    			attr_dev(li0, "class", "svelte-1sf3uqu");
    			add_location(li0, file$2, 2, 4, 26);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$2, 10, 12, 213);
    			attr_dev(a1, "href", "mailto:info@melissawadsworth.co.uk");
    			add_location(a1, file$2, 11, 12, 257);
    			add_location(span1, file$2, 9, 8, 194);
    			attr_dev(li1, "class", "svelte-1sf3uqu");
    			add_location(li1, file$2, 8, 4, 181);
    			attr_dev(i2, "class", "fab fa-instagram");
    			add_location(i2, file$2, 16, 12, 396);
    			attr_dev(a2, "href", "https://www.instagram.com/melissa_wadsworth_artist/");
    			add_location(a2, file$2, 17, 12, 441);
    			add_location(span2, file$2, 15, 8, 377);
    			attr_dev(li2, "class", "svelte-1sf3uqu");
    			add_location(li2, file$2, 14, 4, 364);
    			attr_dev(ul, "class", "svelte-1sf3uqu");
    			add_location(ul, file$2, 1, 0, 17);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, span0);
    			append_dev(span0, i0);
    			append_dev(span0, t2);
    			append_dev(span0, a0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, span1);
    			append_dev(span1, i1);
    			append_dev(span1, t5);
    			append_dev(span1, a1);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, span2);
    			append_dev(span2, i2);
    			append_dev(span2, t8);
    			append_dev(span2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactDetails> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ContactDetails", $$slots, []);
    	return [];
    }

    class ContactDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactDetails",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/About.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/About.svelte";

    function create_fragment$3(ctx) {
    	let h2;
    	let t1;
    	let article;
    	let p0;
    	let t3;
    	let p1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "About";
    			t1 = space();
    			article = element("article");
    			p0 = element("p");
    			p0.textContent = "Melissa Wadsworth is an artist based in the Wiltshire city of Salisbury. Her work often depicts scenes and people from  Salisbury and the surrounding countryside.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Melissa studied at the University of Central England in Birmingham and gained a degree in Ceramics and Glass. After graduating she worked in ceramics before taking a career break to raise a family. Now returning to Art, she finds herself drawn to painting and drawing.";
    			add_location(h2, file$3, 7, 0, 63);
    			attr_dev(p0, "class", "svelte-gx4xix");
    			add_location(p0, file$3, 9, 4, 92);
    			attr_dev(p1, "class", "svelte-gx4xix");
    			add_location(p1, file$3, 10, 4, 266);
    			add_location(article, file$3, 8, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, p0);
    			append_dev(article, t3);
    			append_dev(article, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Gallery.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$4 = "src/Gallery.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (42:6) {#each data as item, i}
    function create_each_block$1(ctx) {
    	let li;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let p0;
    	let t1_value = /*item*/ ctx[5].title + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*item*/ ctx[5].medium + "";
    	let t3;
    	let t4;
    	let p2;
    	let t5_value = /*item*/ ctx[5].year + "";
    	let t5;
    	let t6;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(img, "class", "galleryImage svelte-xofxph");
    			if (img.src !== (img_src_value = "images/" + /*item*/ ctx[5].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*item*/ ctx[5].title + ", " + /*item*/ ctx[5].year));
    			add_location(img, file$4, 44, 12, 1237);
    			attr_dev(p0, "class", "svelte-xofxph");
    			add_location(p0, file$4, 46, 16, 1383);
    			attr_dev(p1, "class", "svelte-xofxph");
    			add_location(p1, file$4, 47, 16, 1419);
    			attr_dev(p2, "class", "svelte-xofxph");
    			add_location(p2, file$4, 48, 16, 1456);
    			attr_dev(div0, "class", "galleryDescription svelte-xofxph");
    			add_location(div0, file$4, 45, 12, 1334);
    			attr_dev(div1, "class", "galleryItemContainer svelte-xofxph");
    			add_location(div1, file$4, 43, 10, 1190);

    			attr_dev(li, "class", li_class_value = "galleryItem " + (/*current*/ ctx[0] === /*i*/ ctx[7]
    			? "galleryItemVisible"
    			: "") + " svelte-xofxph");

    			add_location(li, file$4, 42, 8, 1111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(p2, t5);
    			append_dev(li, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && img.src !== (img_src_value = "images/" + /*item*/ ctx[5].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 2 && img_alt_value !== (img_alt_value = "" + (/*item*/ ctx[5].title + ", " + /*item*/ ctx[5].year))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*data*/ 2 && t1_value !== (t1_value = /*item*/ ctx[5].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 2 && t3_value !== (t3_value = /*item*/ ctx[5].medium + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*data*/ 2 && t5_value !== (t5_value = /*item*/ ctx[5].year + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*current*/ 1 && li_class_value !== (li_class_value = "galleryItem " + (/*current*/ ctx[0] === /*i*/ ctx[7]
    			? "galleryItemVisible"
    			: "") + " svelte-xofxph")) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:6) {#each data as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let button0;
    	let span0;
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let span1;
    	let t5;
    	let button2;
    	let span2;
    	let t6;
    	let ul;
    	let t7;
    	let button3;
    	let span3;
    	let dispose;
    	let each_value = /*data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Gallery";
    			t1 = space();
    			div = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t2 = text(" Previous");
    			t3 = space();
    			button1 = element("button");
    			t4 = text("Next ");
    			span1 = element("span");
    			t5 = space();
    			button2 = element("button");
    			span2 = element("span");
    			t6 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			button3 = element("button");
    			span3 = element("span");
    			add_location(h2, file$4, 33, 0, 528);
    			attr_dev(span0, "class", "fas fa-chevron-left");
    			add_location(span0, file$4, 35, 82, 658);
    			attr_dev(button0, "class", "galleryButtonText galleryButtonTextLeft svelte-xofxph");
    			add_location(button0, file$4, 35, 4, 580);
    			attr_dev(span1, "class", "fas fa-chevron-right");
    			add_location(span1, file$4, 36, 89, 807);
    			attr_dev(button1, "class", "galleryButtonText galleryButtonTextRight svelte-xofxph");
    			add_location(button1, file$4, 36, 4, 722);
    			attr_dev(span2, "class", "fas fa-chevron-left");
    			add_location(span2, file$4, 38, 4, 971);
    			attr_dev(button2, "id", "leftButton");
    			attr_dev(button2, "class", "galleryButton galleryButtonLeft svelte-xofxph");
    			attr_dev(button2, "title", "previous");
    			add_location(button2, file$4, 37, 4, 863);
    			attr_dev(ul, "id", "galleryList");
    			attr_dev(ul, "class", "galleryList svelte-xofxph");
    			add_location(ul, file$4, 40, 4, 1031);
    			attr_dev(span3, "class", "fas fa-chevron-right");
    			add_location(span3, file$4, 55, 4, 1660);
    			attr_dev(button3, "id", "rightButton");
    			attr_dev(button3, "class", "galleryButton galleryButtonRight svelte-xofxph");
    			attr_dev(button3, "title", "next");
    			add_location(button3, file$4, 54, 4, 1553);
    			attr_dev(div, "class", "galleryContainer svelte-xofxph");
    			add_location(div, file$4, 34, 0, 545);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t2);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(button1, t4);
    			append_dev(button1, span1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(button2, span2);
    			append_dev(div, t6);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div, t7);
    			append_dev(div, button3);
    			append_dev(button3, span3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*moveLeft*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*moveRight*/ ctx[2], false, false, false),
    				listen_dev(button2, "click", /*moveLeft*/ ctx[3], false, false, false),
    				listen_dev(button3, "click", /*moveRight*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*current, data*/ 3) {
    				each_value = /*data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function rightClick(e) {
    	console.log(e);
    	return true;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { url } = $$props;
    	let current = 0;
    	let data = [];

    	onMount(async function () {
    		const response = await fetch(url);
    		$$invalidate(1, data = await response.json());
    	});

    	function moveRight() {
    		$$invalidate(0, current = current + 1);

    		if (current >= data.length) {
    			$$invalidate(0, current = 0);
    		}
    	}

    	function moveLeft() {
    		$$invalidate(0, current = current - 1);

    		if (current < 0) {
    			$$invalidate(0, current = data.length - 1);
    		}
    	}

    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		url,
    		current,
    		data,
    		moveRight,
    		moveLeft,
    		rightClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [current, data, moveRight, moveLeft, url];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*url*/ ctx[4] === undefined && !("url" in props)) {
    			console_1.warn("<Gallery> was created without expected prop 'url'");
    		}
    	}

    	get url() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;
    	let hr;
    	let t0;
    	let p0;
    	let i0;
    	let t1;
    	let a0;
    	let t3;
    	let i1;
    	let t4;
    	let a1;
    	let t6;
    	let i2;
    	let t7;
    	let a2;
    	let t9;
    	let p1;
    	let i3;
    	let t10;
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			hr = element("hr");
    			t0 = space();
    			p0 = element("p");
    			i0 = element("i");
    			t1 = space();
    			a0 = element("a");
    			a0.textContent = "+44 (0) 7966 417196";
    			t3 = text(" -\n    ");
    			i1 = element("i");
    			t4 = space();
    			a1 = element("a");
    			a1.textContent = "info@melissawadsworth.co.uk";
    			t6 = text(" -\n    ");
    			i2 = element("i");
    			t7 = space();
    			a2 = element("a");
    			a2.textContent = "melissa_wadsworth_artist";
    			t9 = space();
    			p1 = element("p");
    			i3 = element("i");
    			t10 = space();
    			t11 = text(/*year*/ ctx[0]);
    			t12 = text(" Melissa Wadsworth. All rights reserved.");
    			attr_dev(hr, "class", "svelte-deukhm");
    			add_location(hr, file$5, 36, 4, 610);
    			attr_dev(i0, "class", "fas fa-phone");
    			add_location(i0, file$5, 38, 4, 628);
    			attr_dev(a0, "href", "tel:+447966417196");
    			add_location(a0, file$5, 39, 4, 661);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$5, 40, 4, 719);
    			attr_dev(a1, "href", "mailto:info@melissawadsworth.co.uk");
    			add_location(a1, file$5, 41, 4, 755);
    			attr_dev(i2, "class", "fab fa-instagram");
    			add_location(i2, file$5, 42, 4, 838);
    			attr_dev(a2, "href", "https://www.instagram.com/melissa_wadsworth_artist/");
    			add_location(a2, file$5, 43, 4, 875);
    			attr_dev(p0, "class", "svelte-deukhm");
    			add_location(p0, file$5, 37, 4, 620);
    			attr_dev(i3, "class", "far fa-copyright");
    			add_location(i3, file$5, 45, 7, 982);
    			attr_dev(p1, "class", "svelte-deukhm");
    			add_location(p1, file$5, 45, 4, 979);
    			attr_dev(footer, "class", "siteFooter svelte-deukhm");
    			add_location(footer, file$5, 35, 0, 578);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, hr);
    			append_dev(footer, t0);
    			append_dev(footer, p0);
    			append_dev(p0, i0);
    			append_dev(p0, t1);
    			append_dev(p0, a0);
    			append_dev(p0, t3);
    			append_dev(p0, i1);
    			append_dev(p0, t4);
    			append_dev(p0, a1);
    			append_dev(p0, t6);
    			append_dev(p0, i2);
    			append_dev(p0, t7);
    			append_dev(p0, a2);
    			append_dev(footer, t9);
    			append_dev(footer, p1);
    			append_dev(p1, i3);
    			append_dev(p1, t10);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*year*/ 1) set_data_dev(t11, /*year*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let year;

    	onMount(async function () {
    		$$invalidate(0, year = new Date().getFullYear());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, year });

    	$$self.$inject_state = $$props => {
    		if ("year" in $$props) $$invalidate(0, year = $$props.year);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [year];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Header.svelte generated by Svelte v3.20.1 */

    const file$6 = "src/Header.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let hr;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Melissa Wadsworth";
    			t1 = space();
    			hr = element("hr");
    			add_location(h1, file$6, 1, 4, 32);
    			attr_dev(hr, "class", "fadedRule svelte-14mgdbe");
    			add_location(hr, file$6, 2, 4, 63);
    			attr_dev(header, "class", "siteHeader svelte-14mgdbe");
    			add_location(header, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, hr);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Fetch.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$7 = "src/Fetch.svelte";
    const get_default_slot_changes = dirty => ({ data: dirty & /*data*/ 1 });
    const get_default_slot_context = ctx => ({ data: /*data*/ ctx[0] });

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$7, 13, 0, 241);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, data*/ 5) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { url } = $$props;
    	let data;

    	onMount(async function () {
    		const response = await fetch(url);
    		$$invalidate(0, data = await response.json());
    		console.log(data);
    	});

    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Fetch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fetch", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onMount, url, data });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, url, $$scope, $$slots];
    }

    class Fetch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fetch",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console_1$1.warn("<Fetch> was created without expected prop 'url'");
    		}
    	}

    	get url() {
    		throw new Error("<Fetch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Fetch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/App.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let section0;
    	let t1;
    	let section1;
    	let t2;
    	let section2;
    	let t3;
    	let section3;
    	let t4;
    	let current;
    	const header = new Header({ $$inline: true });
    	const about = new About({ $$inline: true });

    	const gallery = new Gallery({
    			props: { url: "images/images.json" },
    			$$inline: true
    		});

    	const events = new Events({
    			props: { url: "events.json" },
    			$$inline: true
    		});

    	const contactdetails = new ContactDetails({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			section0 = element("section");
    			create_component(about.$$.fragment);
    			t1 = space();
    			section1 = element("section");
    			create_component(gallery.$$.fragment);
    			t2 = space();
    			section2 = element("section");
    			create_component(events.$$.fragment);
    			t3 = space();
    			section3 = element("section");
    			create_component(contactdetails.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(section0, "class", "svelte-oz10bu");
    			add_location(section0, file$8, 38, 8, 763);
    			attr_dev(section1, "class", "svelte-oz10bu");
    			add_location(section1, file$8, 41, 8, 821);
    			attr_dev(section2, "class", "svelte-oz10bu");
    			add_location(section2, file$8, 44, 8, 908);
    			attr_dev(section3, "class", "svelte-oz10bu");
    			add_location(section3, file$8, 47, 8, 987);
    			attr_dev(div0, "class", "mainContent svelte-oz10bu");
    			add_location(div0, file$8, 37, 4, 729);
    			attr_dev(div1, "class", "flexContainer svelte-oz10bu");
    			add_location(div1, file$8, 35, 0, 683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(header, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, section0);
    			mount_component(about, section0, null);
    			append_dev(div0, t1);
    			append_dev(div0, section1);
    			mount_component(gallery, section1, null);
    			append_dev(div0, t2);
    			append_dev(div0, section2);
    			mount_component(events, section2, null);
    			append_dev(div0, t3);
    			append_dev(div0, section3);
    			mount_component(contactdetails, section3, null);
    			append_dev(div1, t4);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			transition_in(events.$$.fragment, local);
    			transition_in(contactdetails.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			transition_out(events.$$.fragment, local);
    			transition_out(contactdetails.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(header);
    			destroy_component(about);
    			destroy_component(gallery);
    			destroy_component(events);
    			destroy_component(contactdetails);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Events,
    		ContactDetails,
    		About,
    		Gallery,
    		Footer,
    		Header,
    		Fetch
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=svelte-bundle.js.map
