
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
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
    			if (dirty & /*events*/ 1 && t_value !== (t_value = /*item*/ ctx[3].title + "")) set_data_dev(t, t_value);
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
    			add_location(a, file$1, 31, 24, 728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*events*/ 1 && t_value !== (t_value = /*item*/ ctx[3].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*events*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[3].url)) {
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
    			add_location(br, file$1, 26, 31, 559);
    			attr_dev(p0, "class", "svelte-1kojbyi");
    			add_location(p0, file$1, 26, 16, 544);
    			attr_dev(span0, "class", "exhibitionsDate svelte-1kojbyi");
    			add_location(span0, file$1, 25, 12, 497);
    			attr_dev(h3, "class", "svelte-1kojbyi");
    			add_location(h3, file$1, 29, 16, 664);
    			attr_dev(p1, "class", "svelte-1kojbyi");
    			add_location(p1, file$1, 36, 16, 893);
    			attr_dev(span1, "class", "exhibitionsDescription svelte-1kojbyi");
    			add_location(span1, file$1, 28, 12, 610);
    			attr_dev(li, "class", "svelte-1kojbyi");
    			add_location(li, file$1, 24, 8, 480);
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
    			if ((!current || dirty & /*events*/ 1) && t0_value !== (t0_value = /*item*/ ctx[3].start + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*events*/ 1) && t1_value !== (t1_value = /*item*/ ctx[3].end + "")) set_data_dev(t1, t1_value);

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

    			if ((!current || dirty & /*events*/ 1) && t4_value !== (t4_value = /*item*/ ctx[3].description + "")) set_data_dev(t4, t4_value);
    			const location_changes = {};
    			if (dirty & /*events*/ 1) location_changes.location = /*item*/ ctx[3].location;
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
    	let t0_value = /*data*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*data*/ ctx[1].description + "";
    	let t2;
    	let t3;
    	let ul;
    	let current;
    	let each_value = /*events*/ ctx[0];
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

    			add_location(h2, file$1, 20, 0, 391);
    			attr_dev(p, "class", "svelte-1kojbyi");
    			add_location(p, file$1, 21, 0, 413);
    			attr_dev(ul, "class", "svelte-1kojbyi");
    			add_location(ul, file$1, 22, 0, 439);
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
    			if ((!current || dirty & /*data*/ 2) && t0_value !== (t0_value = /*data*/ ctx[1].title + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data*/ 2) && t2_value !== (t2_value = /*data*/ ctx[1].description + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*events*/ 1) {
    				each_value = /*events*/ ctx[0];
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
    	let { apiURL } = $$props;
    	let events = [];
    	let data = { title: "", description: "", events: [] };

    	onMount(async function () {
    		const response = await fetch(apiURL);
    		$$invalidate(1, data = await response.json());
    		$$invalidate(0, events = data.events);
    	});

    	const writable_props = ["apiURL"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Events> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Events", $$slots, []);

    	$$self.$set = $$props => {
    		if ("apiURL" in $$props) $$invalidate(2, apiURL = $$props.apiURL);
    	};

    	$$self.$capture_state = () => ({ onMount, Location, apiURL, events, data });

    	$$self.$inject_state = $$props => {
    		if ("apiURL" in $$props) $$invalidate(2, apiURL = $$props.apiURL);
    		if ("events" in $$props) $$invalidate(0, events = $$props.events);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [events, data, apiURL];
    }

    class Events extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { apiURL: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Events",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*apiURL*/ ctx[2] === undefined && !("apiURL" in props)) {
    			console.warn("<Events> was created without expected prop 'apiURL'");
    		}
    	}

    	get apiURL() {
    		throw new Error("<Events>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiURL(value) {
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
    			add_location(li0, file$2, 2, 4, 26);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$2, 10, 12, 213);
    			attr_dev(a1, "href", "mailto:info@melissawadsworth.co.uk");
    			add_location(a1, file$2, 11, 12, 257);
    			add_location(span1, file$2, 9, 8, 194);
    			add_location(li1, file$2, 8, 4, 181);
    			attr_dev(i2, "class", "fab fa-instagram");
    			add_location(i2, file$2, 16, 12, 396);
    			attr_dev(a2, "href", "https://www.instagram.com/melissa_wadsworth_artist/");
    			add_location(a2, file$2, 17, 12, 441);
    			add_location(span2, file$2, 15, 8, 377);
    			add_location(li2, file$2, 14, 4, 364);
    			attr_dev(ul, "class", "svelte-12euhve");
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
    			add_location(h2, file$3, 0, 0, 0);
    			add_location(p0, file$3, 2, 4, 29);
    			add_location(p1, file$3, 3, 4, 203);
    			add_location(article, file$3, 1, 0, 15);
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

    const file$4 = "src/Gallery.svelte";

    function create_fragment$4(ctx) {
    	let h2;
    	let t1;
    	let div14;
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
    	let li0;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let div0;
    	let p0;
    	let t9;
    	let p1;
    	let t11;
    	let p2;
    	let t13;
    	let li1;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t14;
    	let div2;
    	let p3;
    	let t16;
    	let p4;
    	let t18;
    	let p5;
    	let t20;
    	let li2;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t21;
    	let div4;
    	let p6;
    	let t23;
    	let p7;
    	let t25;
    	let p8;
    	let t27;
    	let li3;
    	let div7;
    	let img3;
    	let img3_src_value;
    	let t28;
    	let div6;
    	let p9;
    	let t30;
    	let p10;
    	let t32;
    	let p11;
    	let t34;
    	let li4;
    	let div9;
    	let img4;
    	let img4_src_value;
    	let t35;
    	let div8;
    	let p12;
    	let t37;
    	let p13;
    	let t39;
    	let p14;
    	let t41;
    	let li5;
    	let div11;
    	let img5;
    	let img5_src_value;
    	let t42;
    	let div10;
    	let p15;
    	let t44;
    	let p16;
    	let t46;
    	let p17;
    	let t48;
    	let li6;
    	let div13;
    	let img6;
    	let img6_src_value;
    	let t49;
    	let div12;
    	let p18;
    	let t51;
    	let p19;
    	let t53;
    	let p20;
    	let t55;
    	let button3;
    	let span3;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Gallery";
    			t1 = space();
    			div14 = element("div");
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
    			li0 = element("li");
    			div1 = element("div");
    			img0 = element("img");
    			t7 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Bunting";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "Acrylic on canvas";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "2019";
    			t13 = space();
    			li1 = element("li");
    			div3 = element("div");
    			img1 = element("img");
    			t14 = space();
    			div2 = element("div");
    			p3 = element("p");
    			p3.textContent = "Coombe Bissett Barn III";
    			t16 = space();
    			p4 = element("p");
    			p4.textContent = "Charcoal on paper";
    			t18 = space();
    			p5 = element("p");
    			p5.textContent = "2019";
    			t20 = space();
    			li2 = element("li");
    			div5 = element("div");
    			img2 = element("img");
    			t21 = space();
    			div4 = element("div");
    			p6 = element("p");
    			p6.textContent = "Portrait of a Woman II";
    			t23 = space();
    			p7 = element("p");
    			p7.textContent = "Gouache";
    			t25 = space();
    			p8 = element("p");
    			p8.textContent = "2019";
    			t27 = space();
    			li3 = element("li");
    			div7 = element("div");
    			img3 = element("img");
    			t28 = space();
    			div6 = element("div");
    			p9 = element("p");
    			p9.textContent = "Hill and Vale";
    			t30 = space();
    			p10 = element("p");
    			p10.textContent = "Charcoal on paper";
    			t32 = space();
    			p11 = element("p");
    			p11.textContent = "2019";
    			t34 = space();
    			li4 = element("li");
    			div9 = element("div");
    			img4 = element("img");
    			t35 = space();
    			div8 = element("div");
    			p12 = element("p");
    			p12.textContent = "Trees";
    			t37 = space();
    			p13 = element("p");
    			p13.textContent = "Acrylic on canvas";
    			t39 = space();
    			p14 = element("p");
    			p14.textContent = "2019";
    			t41 = space();
    			li5 = element("li");
    			div11 = element("div");
    			img5 = element("img");
    			t42 = space();
    			div10 = element("div");
    			p15 = element("p");
    			p15.textContent = "Portraits of Lizzy";
    			t44 = space();
    			p16 = element("p");
    			p16.textContent = "Pencil on paper";
    			t46 = space();
    			p17 = element("p");
    			p17.textContent = "2019";
    			t48 = space();
    			li6 = element("li");
    			div13 = element("div");
    			img6 = element("img");
    			t49 = space();
    			div12 = element("div");
    			p18 = element("p");
    			p18.textContent = "Woman";
    			t51 = space();
    			p19 = element("p");
    			p19.textContent = "Pencil on paper";
    			t53 = space();
    			p20 = element("p");
    			p20.textContent = "2019";
    			t55 = space();
    			button3 = element("button");
    			span3 = element("span");
    			add_location(h2, file$4, 14, 0, 425);
    			attr_dev(span0, "class", "fas fa-chevron-left");
    			add_location(span0, file$4, 16, 85, 558);
    			attr_dev(button0, "class", "galleryButtonText galleryButtonTextLeft svelte-11sew8m");
    			attr_dev(button0, "onclick", "moveGallery(1)");
    			add_location(button0, file$4, 16, 4, 477);
    			attr_dev(span1, "class", "fas fa-chevron-right");
    			add_location(span1, file$4, 17, 92, 710);
    			attr_dev(button1, "class", "galleryButtonText galleryButtonTextRight svelte-11sew8m");
    			attr_dev(button1, "onclick", "moveGallery(-1)");
    			add_location(button1, file$4, 17, 4, 622);
    			attr_dev(span2, "class", "fas fa-chevron-left");
    			add_location(span2, file$4, 19, 4, 878);
    			attr_dev(button2, "id", "leftButton");
    			attr_dev(button2, "class", "galleryButton galleryButtonLeft svelte-11sew8m");
    			attr_dev(button2, "onclick", "moveGallery(-1)");
    			attr_dev(button2, "title", "previous");
    			add_location(button2, file$4, 18, 4, 766);
    			attr_dev(img0, "class", "galleryImage svelte-11sew8m");
    			if (img0.src !== (img0_src_value = "images/Bunting.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Bunting, Acrylic on canvas, 2019");
    			add_location(img0, file$4, 24, 8, 1079);
    			attr_dev(p0, "class", "svelte-11sew8m");
    			add_location(p0, file$4, 26, 12, 1224);
    			attr_dev(p1, "class", "svelte-11sew8m");
    			add_location(p1, file$4, 27, 12, 1251);
    			attr_dev(p2, "class", "svelte-11sew8m");
    			add_location(p2, file$4, 28, 12, 1288);
    			attr_dev(div0, "class", "galleryDescription svelte-11sew8m");
    			add_location(div0, file$4, 25, 8, 1179);
    			attr_dev(div1, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div1, file$4, 23, 8, 1036);
    			attr_dev(li0, "class", "galleryItem galleryItemVisible svelte-11sew8m");
    			add_location(li0, file$4, 22, 4, 984);
    			attr_dev(img1, "class", "galleryImage svelte-11sew8m");
    			if (img1.src !== (img1_src_value = "images/Coombe-Bissett-III.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Coombe Bissett Barn III, Charcoal on paper, 2019");
    			add_location(img1, file$4, 34, 8, 1420);
    			attr_dev(p3, "class", "svelte-11sew8m");
    			add_location(p3, file$4, 36, 12, 1592);
    			attr_dev(p4, "class", "svelte-11sew8m");
    			add_location(p4, file$4, 37, 12, 1635);
    			attr_dev(p5, "class", "svelte-11sew8m");
    			add_location(p5, file$4, 38, 12, 1672);
    			attr_dev(div2, "class", "galleryDescription svelte-11sew8m");
    			add_location(div2, file$4, 35, 8, 1547);
    			attr_dev(div3, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div3, file$4, 33, 8, 1377);
    			attr_dev(li1, "class", "galleryItem svelte-11sew8m");
    			add_location(li1, file$4, 32, 4, 1344);
    			attr_dev(img2, "class", "galleryImage svelte-11sew8m");
    			if (img2.src !== (img2_src_value = "images/Portrait-of-a-Woman-II.jpeg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Portrait of a Woman II, Gouache, 2019");
    			add_location(img2, file$4, 44, 8, 1804);
    			attr_dev(p6, "class", "svelte-11sew8m");
    			add_location(p6, file$4, 46, 12, 1969);
    			attr_dev(p7, "class", "svelte-11sew8m");
    			add_location(p7, file$4, 47, 12, 2011);
    			attr_dev(p8, "class", "svelte-11sew8m");
    			add_location(p8, file$4, 48, 12, 2038);
    			attr_dev(div4, "class", "galleryDescription svelte-11sew8m");
    			add_location(div4, file$4, 45, 8, 1924);
    			attr_dev(div5, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div5, file$4, 43, 8, 1761);
    			attr_dev(li2, "class", "galleryItem svelte-11sew8m");
    			add_location(li2, file$4, 42, 4, 1728);
    			attr_dev(img3, "class", "galleryImage svelte-11sew8m");
    			if (img3.src !== (img3_src_value = "images/Hill-and-Vale.jpeg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Hill and Vale, Charcoal on paper, 2019");
    			add_location(img3, file$4, 54, 8, 2170);
    			attr_dev(p9, "class", "svelte-11sew8m");
    			add_location(p9, file$4, 56, 12, 2327);
    			attr_dev(p10, "class", "svelte-11sew8m");
    			add_location(p10, file$4, 57, 12, 2360);
    			attr_dev(p11, "class", "svelte-11sew8m");
    			add_location(p11, file$4, 58, 12, 2397);
    			attr_dev(div6, "class", "galleryDescription svelte-11sew8m");
    			add_location(div6, file$4, 55, 8, 2282);
    			attr_dev(div7, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div7, file$4, 53, 8, 2127);
    			attr_dev(li3, "class", "galleryItem svelte-11sew8m");
    			add_location(li3, file$4, 52, 4, 2094);
    			attr_dev(img4, "class", "galleryImage svelte-11sew8m");
    			if (img4.src !== (img4_src_value = "images/Trees.jpeg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Trees, Acrylic on canvas, 2019");
    			add_location(img4, file$4, 64, 8, 2533);
    			attr_dev(p12, "class", "svelte-11sew8m");
    			add_location(p12, file$4, 66, 12, 2674);
    			attr_dev(p13, "class", "svelte-11sew8m");
    			add_location(p13, file$4, 67, 12, 2699);
    			attr_dev(p14, "class", "svelte-11sew8m");
    			add_location(p14, file$4, 68, 12, 2736);
    			attr_dev(div8, "class", "galleryDescription svelte-11sew8m");
    			add_location(div8, file$4, 65, 8, 2629);
    			attr_dev(div9, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div9, file$4, 63, 8, 2490);
    			attr_dev(li4, "class", "galleryItem svelte-11sew8m");
    			add_location(li4, file$4, 62, 4, 2457);
    			attr_dev(img5, "class", "galleryImage svelte-11sew8m");
    			if (img5.src !== (img5_src_value = "images/Portraits-of-Lizzy.jpeg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Portraits of Lizzy, Pencil on paper, 2019");
    			add_location(img5, file$4, 74, 12, 2872);
    			attr_dev(p15, "class", "svelte-11sew8m");
    			add_location(p15, file$4, 76, 12, 3041);
    			attr_dev(p16, "class", "svelte-11sew8m");
    			add_location(p16, file$4, 77, 12, 3079);
    			attr_dev(p17, "class", "svelte-11sew8m");
    			add_location(p17, file$4, 78, 12, 3114);
    			attr_dev(div10, "class", "galleryDescription svelte-11sew8m");
    			add_location(div10, file$4, 75, 12, 2996);
    			attr_dev(div11, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div11, file$4, 73, 8, 2825);
    			attr_dev(li5, "class", "galleryItem svelte-11sew8m");
    			add_location(li5, file$4, 72, 4, 2792);
    			attr_dev(img6, "class", "galleryImage svelte-11sew8m");
    			if (img6.src !== (img6_src_value = "images/Portrait-of-a-Woman-I.jpeg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Portrait of a Woman I, Pencil on paper, 2019");
    			add_location(img6, file$4, 84, 12, 3266);
    			attr_dev(p18, "class", "svelte-11sew8m");
    			add_location(p18, file$4, 86, 16, 3445);
    			attr_dev(p19, "class", "svelte-11sew8m");
    			add_location(p19, file$4, 87, 16, 3474);
    			attr_dev(p20, "class", "svelte-11sew8m");
    			add_location(p20, file$4, 88, 16, 3513);
    			attr_dev(div12, "class", "galleryDescription svelte-11sew8m");
    			add_location(div12, file$4, 85, 12, 3396);
    			attr_dev(div13, "class", "galleryItemContainer svelte-11sew8m");
    			add_location(div13, file$4, 83, 12, 3219);
    			attr_dev(li6, "class", "galleryItem svelte-11sew8m");
    			add_location(li6, file$4, 82, 8, 3182);
    			attr_dev(ul, "id", "galleryList");
    			attr_dev(ul, "class", "galleryList svelte-11sew8m");
    			add_location(ul, file$4, 21, 4, 938);
    			attr_dev(span3, "class", "fas fa-chevron-right");
    			add_location(span3, file$4, 94, 4, 3704);
    			attr_dev(button3, "id", "rightButton");
    			attr_dev(button3, "class", "galleryButton galleryButtonRight svelte-11sew8m");
    			attr_dev(button3, "onclick", "moveGallery(1)");
    			attr_dev(button3, "title", "next");
    			add_location(button3, file$4, 93, 4, 3595);
    			attr_dev(div14, "class", "galleryContainer svelte-11sew8m");
    			add_location(div14, file$4, 15, 0, 442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div14, anchor);
    			append_dev(div14, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t2);
    			append_dev(div14, t3);
    			append_dev(div14, button1);
    			append_dev(button1, t4);
    			append_dev(button1, span1);
    			append_dev(div14, t5);
    			append_dev(div14, button2);
    			append_dev(button2, span2);
    			append_dev(div14, t6);
    			append_dev(div14, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t9);
    			append_dev(div0, p1);
    			append_dev(div0, t11);
    			append_dev(div0, p2);
    			append_dev(ul, t13);
    			append_dev(ul, li1);
    			append_dev(li1, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t14);
    			append_dev(div3, div2);
    			append_dev(div2, p3);
    			append_dev(div2, t16);
    			append_dev(div2, p4);
    			append_dev(div2, t18);
    			append_dev(div2, p5);
    			append_dev(ul, t20);
    			append_dev(ul, li2);
    			append_dev(li2, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t21);
    			append_dev(div5, div4);
    			append_dev(div4, p6);
    			append_dev(div4, t23);
    			append_dev(div4, p7);
    			append_dev(div4, t25);
    			append_dev(div4, p8);
    			append_dev(ul, t27);
    			append_dev(ul, li3);
    			append_dev(li3, div7);
    			append_dev(div7, img3);
    			append_dev(div7, t28);
    			append_dev(div7, div6);
    			append_dev(div6, p9);
    			append_dev(div6, t30);
    			append_dev(div6, p10);
    			append_dev(div6, t32);
    			append_dev(div6, p11);
    			append_dev(ul, t34);
    			append_dev(ul, li4);
    			append_dev(li4, div9);
    			append_dev(div9, img4);
    			append_dev(div9, t35);
    			append_dev(div9, div8);
    			append_dev(div8, p12);
    			append_dev(div8, t37);
    			append_dev(div8, p13);
    			append_dev(div8, t39);
    			append_dev(div8, p14);
    			append_dev(ul, t41);
    			append_dev(ul, li5);
    			append_dev(li5, div11);
    			append_dev(div11, img5);
    			append_dev(div11, t42);
    			append_dev(div11, div10);
    			append_dev(div10, p15);
    			append_dev(div10, t44);
    			append_dev(div10, p16);
    			append_dev(div10, t46);
    			append_dev(div10, p17);
    			append_dev(ul, t48);
    			append_dev(ul, li6);
    			append_dev(li6, div13);
    			append_dev(div13, img6);
    			append_dev(div13, t49);
    			append_dev(div13, div12);
    			append_dev(div12, p18);
    			append_dev(div12, t51);
    			append_dev(div12, p19);
    			append_dev(div12, t53);
    			append_dev(div12, p20);
    			append_dev(div14, t55);
    			append_dev(div14, button3);
    			append_dev(button3, span3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div14);
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

    function moveGallery(direction) {
    	let pic = document.querySelector(".galleryItemVisible");
    	let next;

    	if (direction > 0) {
    		next = pic.nextElementSibling || pic.parentElement.firstElementChild;
    	} else if (direction < 0) {
    		next = pic.previousElementSibling || pic.parentElement.lastElementChild;
    	}

    	pic.classList.remove("galleryItemVisible");
    	next.classList.add("galleryItemVisible");
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", $$slots, []);
    	$$self.$capture_state = () => ({ moveGallery });
    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    new Events({
    	target: document.querySelector('#exhibitions'),
    	props: {
    		apiURL: "events.json"
    	}
    });

    new ContactDetails({
    	target: document.querySelector('#contact')
    });

    new About({
    	target: document.querySelector('#about')
    });

    new Gallery({
    	target: document.querySelector('#gallery')
    });

}());
//# sourceMappingURL=svelte-bundle.js.map
