
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
            set_current_component(null);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
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
        if (text.wholeText === data)
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.26.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
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
    			if (default_slot) default_slot.d(detaching);
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
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.26.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.26.0 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
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
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Languages = {
        nb: {
            lang: 'nb',
            apptitle: "Beetlejuice",
            dilemma: "dilemma",
            question: 'spørsmål',
            claim: 'utsagn',
            gameSetupDone: "Spill oppsett ferdig",
            startgame: "Start spill",
            setUpNewGame: "Sett opp nytt spill",
            homeLink: 'Hjem',
            homePage: 'Denne siden er ikke ferdig, så du får sjekke ut noen av de andre',
            aboutLink: "Om oss",
            aboutpagetitle: 'Velkommen til Beetljuice Drikkespillet!',
            aboutpagecontent: 'Dette er bare for morro, men hvis du føler for å bidra er det bare å ta kontakt med oss',
            bottlespinnLink: "Flaskespinn",
            bottelspinnButton: "Spinn flasken",
            addNewLink: 'Legg til ny',
            claimtitle: 'Nytt utsagn',
            questiontitle: 'Nytt spørsmål',
            newGameLink: 'Nytt spill',
            language: 'språk',
            category: 'kategori',
            addQuestion: 'Legg til spørsmål',
            addClaim: 'Legg til påstand',
            addDilemma: 'Legg til dilemma',
            text: "tekst",
            success: 'Suksess!',
            successmessage: 'ble lagt til ditt spill',
            categoryerror: 'du må velge en kategori',
            languageerror: 'du må velge et språk',
            gameover: 'Spill ferdig',
            gameovermessage: 'Dette spillet er nå ferdig, men start gjerne et nytt',
            next: 'neste',
            get: 'Hent',
        },
        en: {
            lang: 'en',
            apptitle: "Beetlejuice",
            dilemma: "dilemma",
            question: 'question',
            claim: 'claim',
            gameSetupDone: "Game setup done",
            startgame: "Start game",
            setUpNewGame: "Set up new game",
            homeLink: 'Home',
            homePage: 'This site is under construction, check out Add new and bottlespinn',
            aboutLink: "About",
            aboutpagetitle: 'Welcome to Beetlejuice drinking game app!',
            aboutpagecontent: 'This is just for fun, but if you are looking to contribute please feel free to contact us',
            bottlespinnLink: "Bottlespinn",
            bottelspinnButton: "spin bottle",
            addNewLink: 'Add new',
            claimtitle: 'New Claim',
            questiontitle: 'New Question',
            newGameLink: 'New game',
            language: 'language',
            category: 'category',
            addQuestion: 'Add question',
            addClaim: 'Add claim',
            addDilemma: 'Add dilemma',
            text: "text",
            success: 'Success!',
            successmessage: 'was added to your game',
            categoryerror: 'you have to select a category',
            languageerror: 'you have to select a language',
            gameover: 'Game over',
            gameovermessage: 'the game is now finished, but feel free to start a new one.',
            next: 'neste',
            get: 'Get',
        }
    };

    const startLang = Languages.en;
    const languageStore = writable(startLang);
    const counterStore = {
        subscribe: languageStore.subscribe,
        setEN: () => languageStore.set(Languages.en),
        setNB: () => languageStore.set(Languages.nb)
    };

    /* src/pages/Home.svelte generated by Svelte v3.26.0 */
    const file$1 = "src/pages/Home.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let p;
    	let t_value = /*$languageStore*/ ctx[0].homePage + "";
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			p = claim_element(main_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, t_value);
    			p_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-vt4otf");
    			add_location(p, file$1, 24, 4, 414);
    			attr_dev(main, "class", "svelte-vt4otf");
    			add_location(main, file$1, 23, 0, 403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$languageStore*/ 1 && t_value !== (t_value = /*$languageStore*/ ctx[0].homePage + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(0, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ languageStore: counterStore, $languageStore });
    	return [$languageStore];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/About.svelte generated by Svelte v3.26.0 */
    const file$2 = "src/pages/About.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h2;
    	let t2_value = /*$languageStore*/ ctx[0].aboutpagetitle + "";
    	let t2;
    	let t3;
    	let h3;
    	let t4_value = /*$languageStore*/ ctx[0].aboutpagecontent + "";
    	let t4;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			h3 = element("h3");
    			t4 = text(t4_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			br0 = claim_element(main_nodes, "BR", {});
    			t0 = claim_space(main_nodes);
    			br1 = claim_element(main_nodes, "BR", {});
    			t1 = claim_space(main_nodes);
    			h2 = claim_element(main_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t2 = claim_text(h2_nodes, t2_value);
    			h2_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			h3 = claim_element(main_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t4 = claim_text(h3_nodes, t4_value);
    			h3_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br0, file$2, 28, 4, 451);
    			add_location(br1, file$2, 29, 4, 462);
    			attr_dev(h2, "class", "svelte-qpbgr7");
    			add_location(h2, file$2, 30, 4, 473);
    			attr_dev(h3, "class", "svelte-qpbgr7");
    			add_location(h3, file$2, 31, 4, 518);
    			attr_dev(main, "class", "svelte-qpbgr7");
    			add_location(main, file$2, 27, 0, 440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, h2);
    			append_dev(h2, t2);
    			append_dev(main, t3);
    			append_dev(main, h3);
    			append_dev(h3, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$languageStore*/ 1 && t2_value !== (t2_value = /*$languageStore*/ ctx[0].aboutpagetitle + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$languageStore*/ 1 && t4_value !== (t4_value = /*$languageStore*/ ctx[0].aboutpagecontent + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(0, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ languageStore: counterStore, $languageStore });
    	return [$languageStore];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Bottlespinn.svelte generated by Svelte v3.26.0 */
    const file$3 = "src/pages/Bottlespinn.svelte";

    // (60:8) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", {
    				style: true,
    				src: true,
    				alt: true,
    				id: true,
    				class: true
    			});

    			this.h();
    		},
    		h: function hydrate() {
    			set_style(img, "transform", "rotate(" + /*imagePosition*/ ctx[1] + "deg)");
    			if (img.src !== (img_src_value = "bajablast.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "background");
    			attr_dev(img, "id", "myimage");
    			attr_dev(img, "class", "svelte-1kkmkkj");
    			add_location(img, file$3, 60, 12, 1381);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagePosition*/ 2) {
    				set_style(img, "transform", "rotate(" + /*imagePosition*/ ctx[1] + "deg)");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(60:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {#if visibleSpin}
    function create_if_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_intro;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", {
    				class: true,
    				src: true,
    				alt: true,
    				id: true
    			});

    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "class", "centered svelte-1kkmkkj");
    			if (img.src !== (img_src_value = "bajablast.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "background");
    			attr_dev(img, "id", "myimage");
    			add_location(img, file$3, 58, 12, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, spin, { duration: 5000 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(58:8) {#if visibleSpin}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let div;
    	let button;
    	let t0_value = /*$languageStore*/ ctx[2].bottelspinnButton + "";
    	let t0;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*visibleSpin*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			div = claim_element(main_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			button = claim_element(div_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t0 = claim_text(button_nodes, t0_value);
    			button_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			br0 = claim_element(div_nodes, "BR", {});
    			t2 = claim_space(div_nodes);
    			br1 = claim_element(div_nodes, "BR", {});
    			t3 = claim_space(div_nodes);
    			if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "svelte-1kkmkkj");
    			add_location(button, file$3, 54, 8, 1104);
    			add_location(br0, file$3, 55, 8, 1189);
    			add_location(br1, file$3, 56, 8, 1204);
    			attr_dev(div, "class", "bottlecontainer svelte-1kkmkkj");
    			add_location(div, file$3, 53, 4, 1066);
    			add_location(main, file$3, 52, 0, 1055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);
    			append_dev(div, br1);
    			append_dev(div, t3);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleVisible*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$languageStore*/ 4 && t0_value !== (t0_value = /*$languageStore*/ ctx[2].bottelspinnButton + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			dispose();
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

    function rotateImage() {
    	return Math.floor(Math.random() * 360);
    }

    function spin(node, { duration }) {
    	return {
    		duration,
    		css: t => {
    			return `
                    transform: rotate(${t * 360 * duration}deg);
                `;
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(2, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Bottlespinn", slots, []);
    	let visibleSpin = false;
    	let imagePosition = 360;

    	function toggleVisible() {
    		$$invalidate(0, visibleSpin = true);
    		$$invalidate(1, imagePosition = rotateImage());

    		setTimeout(
    			() => {
    				$$invalidate(0, visibleSpin = false);
    			},
    			3000
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bottlespinn> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		languageStore: counterStore,
    		rotateImage,
    		visibleSpin,
    		imagePosition,
    		spin,
    		toggleVisible,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("visibleSpin" in $$props) $$invalidate(0, visibleSpin = $$props.visibleSpin);
    		if ("imagePosition" in $$props) $$invalidate(1, imagePosition = $$props.imagePosition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visibleSpin, imagePosition, $languageStore, toggleVisible];
    }

    class Bottlespinn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bottlespinn",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    //TODO add to env
    const apiBaseUrl = 'http://localhost:3000/';
    //TODO move to routes file
    const questionUrl = apiBaseUrl + 'question';
    const claimUrl = apiBaseUrl + 'claim';
    const categoryUrl = apiBaseUrl + 'category';
    const languageUrl = apiBaseUrl + 'language';
    const randomquestion = questionUrl + '/randomquantity';
    const randomclaim = claimUrl + '/randomquantity';
    function arrayToParamstring(paramarray) {
        let returnstring = '';
        paramarray.map((i) => (returnstring = returnstring + '/' + i));
        return returnstring;
    }
    async function doPost(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const json = await res.json();
    }
    async function doGet(url) {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    }
    //TODO create params function
    async function doGetWithParams(url, params) {
        const res = await fetch(url + params, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.26.0 */

    const file$4 = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl");
    			add_location(div, file$4, 61, 0, 1353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.26.0 */
    const file$5 = "node_modules/svelte-select/src/VirtualList.svelte";

    const get_default_slot_changes$1 = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context$1 = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (160:57) Missing template
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(160:57) Missing template",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context$1);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			svelte_virtual_list_row = claim_element(nodes, "SVELTE-VIRTUAL-LIST-ROW", { class: true });
    			var svelte_virtual_list_row_nodes = children(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.l(svelte_virtual_list_row_nodes);
    			t = claim_space(svelte_virtual_list_row_nodes);
    			svelte_virtual_list_row_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_row, file$5, 158, 3, 3514);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			svelte_virtual_list_viewport = claim_element(nodes, "SVELTE-VIRTUAL-LIST-VIEWPORT", { style: true, class: true });
    			var svelte_virtual_list_viewport_nodes = children(svelte_virtual_list_viewport);
    			svelte_virtual_list_contents = claim_element(svelte_virtual_list_viewport_nodes, "SVELTE-VIRTUAL-LIST-CONTENTS", { style: true, class: true });
    			var svelte_virtual_list_contents_nodes = children(svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(svelte_virtual_list_contents_nodes);
    			}

    			svelte_virtual_list_contents_nodes.forEach(detach_dev);
    			svelte_virtual_list_viewport_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_contents, file$5, 156, 1, 3364);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$5, 154, 0, 3222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    				const each_value = /*visible*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", slots, ['default']);
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(2, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(20, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(3, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(2, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(4, viewport_height);
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(2, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(3, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(4, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(20, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 1054736) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		$$scope,
    		slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.26.0 */
    const file$6 = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3(ctx) {
    	let div;
    	let virtuallist;
    	let current;

    	virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(virtuallist.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "listContainer virtualList svelte-ux0sbr");
    			add_location(div, file$6, 210, 0, 5850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (switch_instance) claim_component(switch_instance.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$6, 214, 4, 5972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			if (each_1_else) {
    				each_1_else.l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "listContainer svelte-ux0sbr");
    			add_location(div, file$6, 232, 0, 6482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[23](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			t = claim_text(div_nodes, /*noOptionsMessage*/ ctx[11]);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "empty svelte-ux0sbr");
    			add_location(div, file$6, 255, 6, 7186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block$2(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1(...args) {
    		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (switch_instance) claim_component(switch_instance.$$.fragment, div_nodes);
    			t = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$6, 237, 4, 6696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    					listen_dev(div, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			t = claim_text(div_nodes, t_value);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "listGroupTitle svelte-ux0sbr");
    			add_location(div, file$6, 235, 6, 6616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block0) if_block0.l(nodes);
    			t = claim_space(nodes);
    			if (if_block1) if_block1.l(nodes);
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
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

    function itemClasses(hoverItemIndex, item, itemIndex, items, selectedValue, optionIdentifier, isMulti) {
    	return `${selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]
	? "active "
	: ""}${hoverItemIndex === itemIndex || items.length === 1
	? "hover"
	: ""}`;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	}); // clearTimeout(isScrollingTimer);

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		// if (prev_activeItemIndex && activeItemIndex > -1) {
    		//   hoverItemIndex = activeItemIndex;
    		//   scrollToActiveItem('active');
    		// }
    		// if (prev_selectedValue && selectedValue) {
    		//   scrollToActiveItem('active');
    		//   if (items && !isMulti) {
    		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
    		//     if (hoverItemIndex) {
    		//       hoverItemIndex = hoverItemIndex;
    		//     }
    		//   }
    		// }
    		prev_items = items;

    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		dispatch,
    		container,
    		ItemComponent: Item,
    		VirtualList,
    		Item: Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		itemClasses,
    		handleSelect,
    		handleHover,
    		handleClick,
    		closeList,
    		updateHoverItem,
    		handleKeyDown,
    		scrollToActiveItem,
    		isItemActive,
    		isItemFirst,
    		isItemHover
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		hoverItemIndex,
    		Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.26.0 */

    const file$7 = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "selection svelte-ch6bh7");
    			add_location(div, file$7, 13, 0, 210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Selection", slots, []);
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ getSelectionLabel, item });

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.26.0 */
    const file$8 = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (22:2) {#if !isDisabled}
    function create_if_block$3(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			svg = claim_element(
    				div_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					focusable: true,
    					role: true,
    					class: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$8, 24, 6, 806);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-14r1jr2");
    			add_location(svg, file$8, 23, 4, 707);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-14r1jr2");
    			add_location(div, file$8, 22, 2, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:2) {#if !isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#each selectedValue as value, i}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let if_block = !/*isDisabled*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			if (if_block) if_block.l(div1_nodes);
    			t1 = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "multiSelectItem_label svelte-14r1jr2");
    			add_location(div0, file$8, 18, 2, 519);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2");

    			add_location(div1, file$8, 17, 0, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getSelectionLabel, selectedValue*/ 9 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, handleClear, getSelectionLabel, selectedValue*/ 31) {
    				each_value = /*selectedValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelection", slots, []);
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = ["selectedValue", "activeSelectedValue", "isDisabled", "getSelectionLabel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, event) => handleClear(i, event);

    	$$self.$$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear,
    		click_handler
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			getSelectionLabel: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;
    	    
        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;
    	
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);
    	
        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.26.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$9 = "node_modules/svelte-select/src/Select.svelte";

    // (798:2) {#if Icon}
    function create_if_block_7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*iconProps*/ ctx[17]];
    	var switch_value = /*Icon*/ ctx[16];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*iconProps*/ 131072)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*iconProps*/ ctx[17])])
    			: {};

    			if (switch_value !== (switch_value = /*Icon*/ ctx[16])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(798:2) {#if Icon}",
    		ctx
    	});

    	return block;
    }

    // (802:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[7];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[23],
    				isDisabled: /*isDisabled*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[27]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];
    			if (dirty[0] & /*activeSelectedValue*/ 8388608) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[23];
    			if (dirty[0] & /*isDisabled*/ 512) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[9];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[27]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[30]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(802:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (822:2) {:else}
    function create_else_block_1$1(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[24],
    		{ placeholder: /*placeholderText*/ ctx[26] },
    		{ style: /*inputStyles*/ ctx[14] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			this.h();
    		},
    		l: function claim(nodes) {
    			input_1 = claim_element(nodes, "INPUT", { placeholder: true, style: true });
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-1kmtf2c", true);
    			add_location(input_1, file$9, 822, 4, 20314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding_1*/ ctx[60](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[30], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler_1*/ ctx[61])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 16777216 && /*_inputAttributes*/ ctx[24],
    				dirty[0] & /*placeholderText*/ 67108864 && { placeholder: /*placeholderText*/ ctx[26] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-1kmtf2c", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding_1*/ ctx[60](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(822:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (813:2) {#if isDisabled}
    function create_if_block_5(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[24],
    		{ placeholder: /*placeholderText*/ ctx[26] },
    		{ style: /*inputStyles*/ ctx[14] },
    		{ disabled: true }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			this.h();
    		},
    		l: function claim(nodes) {
    			input_1 = claim_element(nodes, "INPUT", {
    				placeholder: true,
    				style: true,
    				disabled: true
    			});

    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-1kmtf2c", true);
    			add_location(input_1, file$9, 813, 4, 20102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[58](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[30], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[59])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 16777216 && /*_inputAttributes*/ ctx[24],
    				dirty[0] & /*placeholderText*/ 67108864 && { placeholder: /*placeholderText*/ ctx[26] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] },
    				{ disabled: true }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-1kmtf2c", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[58](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(813:2) {#if isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (832:2) {#if !isMulti && showSelectedItem}
    function create_if_block_4(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (switch_instance) claim_component(switch_instance.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "selectedItem svelte-1kmtf2c");
    			add_location(div, file$9, 832, 4, 20547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[30], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.item = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(832:2) {#if !isMulti && showSelectedItem}",
    		ctx
    	});

    	return block;
    }

    // (841:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_3$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			svg = claim_element(
    				div_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					focusable: true,
    					role: true,
    					class: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { fill: true, d: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$9, 848, 8, 21010);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-1kmtf2c");
    			add_location(svg, file$9, 842, 6, 20869);
    			attr_dev(div, "class", "clearSelect svelte-1kmtf2c");
    			add_location(div, file$9, 841, 4, 20799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[22]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(841:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (857:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
    function create_if_block_1$2(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*indicatorSvg*/ ctx[21]) return create_if_block_2$1;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "indicator svelte-1kmtf2c");
    			add_location(div, file$9, 857, 4, 21444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(857:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}",
    		ctx
    	});

    	return block;
    }

    // (861:6) {:else}
    function create_else_block$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					focusable: true,
    					class: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n            0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n            0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$9, 866, 10, 21665);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "svelte-1kmtf2c");
    			add_location(svg, file$9, 861, 8, 21544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(861:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (859:6) {#if indicatorSvg}
    function create_if_block_2$1(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			html_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*indicatorSvg*/ ctx[21], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*indicatorSvg*/ 2097152) html_tag.p(/*indicatorSvg*/ ctx[21]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(859:6) {#if indicatorSvg}",
    		ctx
    	});

    	return block;
    }

    // (878:2) {#if isWaiting}
    function create_if_block$4(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			svg = claim_element(div_nodes, "svg", { class: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);

    			circle = claim_element(
    				svg_nodes,
    				"circle",
    				{
    					class: true,
    					cx: true,
    					cy: true,
    					r: true,
    					fill: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true
    				},
    				1
    			);

    			children(circle).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(circle, "class", "spinner_path svelte-1kmtf2c");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$9, 880, 8, 22170);
    			attr_dev(svg, "class", "spinner_icon svelte-1kmtf2c");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$9, 879, 6, 22113);
    			attr_dev(div, "class", "spinner svelte-1kmtf2c");
    			add_location(div, file$9, 878, 4, 22085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(878:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*Icon*/ ctx[16] && create_if_block_7(ctx);
    	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0 && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isDisabled*/ ctx[9]) return create_if_block_5;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[25] && create_if_block_4(ctx);
    	let if_block4 = /*showSelectedItem*/ ctx[25] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && create_if_block_3$1(ctx);
    	let if_block5 = (/*showIndicator*/ ctx[19] || (/*showChevron*/ ctx[18] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[25] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[25]))) && create_if_block_1$2(ctx);
    	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, style: true });
    			var div_nodes = children(div);
    			if (if_block0) if_block0.l(div_nodes);
    			t0 = claim_space(div_nodes);
    			if (if_block1) if_block1.l(div_nodes);
    			t1 = claim_space(div_nodes);
    			if_block2.l(div_nodes);
    			t2 = claim_space(div_nodes);
    			if (if_block3) if_block3.l(div_nodes);
    			t3 = claim_space(div_nodes);
    			if (if_block4) if_block4.l(div_nodes);
    			t4 = claim_space(div_nodes);
    			if (if_block5) if_block5.l(div_nodes);
    			t5 = claim_space(div_nodes);
    			if (if_block6) if_block6.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[20] + " svelte-1kmtf2c");
    			attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			add_location(div, file$9, 787, 0, 19479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			/*div_binding*/ ctx[62](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*handleWindowClick*/ ctx[31], false, false, false),
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[29], false, false, false),
    					listen_dev(window, "resize", /*getPosition*/ ctx[28], false, false, false),
    					listen_dev(div, "click", /*handleClick*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Icon*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*Icon*/ 65536) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, selectedValue*/ 264) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			}

    			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[25]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, showSelectedItem*/ 33554688) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[25] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_3$1(ctx);
    					if_block4.c();
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*showIndicator*/ ctx[19] || (/*showChevron*/ ctx[18] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[25] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[25]))) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1$2(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*isWaiting*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$4(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses*/ 1048576 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[20] + " svelte-1kmtf2c")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 2048) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			}

    			if (dirty[0] & /*containerClasses, hasError*/ 1049600) {
    				toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			}

    			if (dirty[0] & /*containerClasses, isMulti*/ 1048832) {
    				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			}

    			if (dirty[0] & /*containerClasses, isDisabled*/ 1049088) {
    				toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			}

    			if (dirty[0] & /*containerClasses, isFocused*/ 1048580) {
    				toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			/*div_binding*/ ctx[62](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { Icon = undefined } = $$props;
    	let { iconProps = {} } = $$props;
    	let { showChevron = false } = $$props;
    	let { showIndicator = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { indicatorSvg = undefined } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(4, filterText = "");
    	}

    	let getItemsHasInvoked = false;

    	const getItems = debounce(
    		async () => {
    			getItemsHasInvoked = true;
    			$$invalidate(5, isWaiting = true);

    			let res = await loadOptions(filterText).catch(err => {
    				console.warn("svelte-select loadOptions error :>> ", err);
    				dispatch("error", { type: "loadOptions", details: err });
    			});

    			if (res) {
    				$$invalidate(33, items = [...res]);
    			} else {
    				$$invalidate(33, items = []);
    			}

    			$$invalidate(5, isWaiting = false);
    			$$invalidate(2, isFocused = true);
    			$$invalidate(34, listOpen = true);
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(2, isFocused = true);
    				$$invalidate(34, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(34, listOpen = true);

    					if (isMulti) {
    						$$invalidate(23, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = createItem(filterText);
    				itemToCreate.isCreator = true;

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			if (!noDuplicates) $$invalidate(3, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	async function setList(items) {
    		await tick();
    		if (list) return list.$set({ items });
    		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(3, selectedValue = undefined);
    		} else {
    			$$invalidate(3, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(34, listOpen = true);
    				$$invalidate(23, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(34, listOpen = true);
    				$$invalidate(23, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(2, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(23, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(23, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(23, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(23, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(23, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(2, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(23, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(35, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(35, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;

    		const eventTarget = event.path && event.path.length > 0
    		? event.path[0]
    		: event.target;

    		if (container.contains(eventTarget)) return;
    		$$invalidate(2, isFocused = false);
    		$$invalidate(34, listOpen = false);
    		$$invalidate(23, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(2, isFocused = true);
    		$$invalidate(34, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(3, selectedValue = undefined);
    		$$invalidate(34, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item: Item$1,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems,
    			itemHeight
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			visibility: "hidden"
    		});

    		$$invalidate(35, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(35, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (!item.isGroupHeader || item.isSelectable) {
    					if (isMulti) {
    						$$invalidate(3, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    					} else {
    						$$invalidate(3, selectedValue = item);
    					}

    					resetFilter();
    					(($$invalidate(3, selectedValue), $$invalidate(46, optionIdentifier)), $$invalidate(8, isMulti));

    					setTimeout(() => {
    						$$invalidate(34, listOpen = false);
    						$$invalidate(23, activeSelectedValue = undefined);
    					});
    				}
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(3, selectedValue = selectedValue || []);
    				$$invalidate(3, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(3, selectedValue = createItem(detail));
    			}

    			$$invalidate(4, filterText = "");
    			$$invalidate(34, listOpen = false);
    			$$invalidate(23, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(34, listOpen = false);
    		});

    		($$invalidate(35, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(64, originalItemsClone = JSON.stringify(items));
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth",
    		"itemHeight",
    		"Icon",
    		"iconProps",
    		"showChevron",
    		"showIndicator",
    		"containerClasses",
    		"indicatorSvg"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function input_1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler_1() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(37, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(38, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(39, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(33, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(40, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(41, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(42, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(43, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(44, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(45, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(46, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(47, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(48, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(49, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(50, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(34, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(35, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(51, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(52, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(53, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(54, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(36, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(55, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(56, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(57, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(17, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(18, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(19, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(20, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(21, indicatorSvg = $$props.indicatorSvg);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		List,
    		ItemComponent: Item,
    		SelectionComponent: Selection,
    		MultiSelectionComponent: MultiSelection,
    		isOutOfViewport,
    		debounce,
    		dispatch,
    		container,
    		input,
    		Item: Item$1,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		createGroupHeaderItem,
    		createItem,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		isWaiting,
    		listPlacement,
    		listOpen,
    		list,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		filteredItems,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		target,
    		activeSelectedValue,
    		_items,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		resetFilter,
    		getItemsHasInvoked,
    		getItems,
    		_inputAttributes,
    		checkSelectedValueForDuplicates,
    		setList,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		removeList,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		loadList,
    		disabled,
    		showSelectedItem,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(37, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(38, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(39, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(33, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(40, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(41, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(42, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(43, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(44, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(45, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(46, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(47, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(48, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(49, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(50, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(34, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(35, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(51, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(52, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(53, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(54, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(36, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(55, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(56, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(57, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(17, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(18, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(19, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(20, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(21, indicatorSvg = $$props.indicatorSvg);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(23, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(73, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(64, originalItemsClone = $$props.originalItemsClone);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("getItemsHasInvoked" in $$props) getItemsHasInvoked = $$props.getItemsHasInvoked;
    		if ("_inputAttributes" in $$props) $$invalidate(24, _inputAttributes = $$props._inputAttributes);
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("showSelectedItem" in $$props) $$invalidate(25, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(26, placeholderText = $$props.placeholderText);
    	};

    	let disabled;
    	let showSelectedItem;
    	let placeholderText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isDisabled*/ 512) {
    			 disabled = isDisabled;
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, isMulti*/ 264 | $$self.$$.dirty[1] & /*optionIdentifier*/ 32768) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(3, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				} else if (isMulti && Array.isArray(selectedValue) && selectedValue.length > 0) {
    					$$invalidate(3, selectedValue = selectedValue.map(item => typeof item === "string"
    					? { value: item, label: item }
    					: item));
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*noOptionsMessage, list*/ 4194320) {
    			 {
    				if (noOptionsMessage && list) list.$set({ noOptionsMessage });
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 24) {
    			 $$invalidate(25, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 8 | $$self.$$.dirty[1] & /*placeholder*/ 256) {
    			 $$invalidate(26, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 8192 | $$self.$$.dirty[1] & /*inputAttributes*/ 16777216) {
    			 {
    				$$invalidate(24, _inputAttributes = Object.assign(inputAttributes, {
    					autocomplete: "off",
    					autocorrect: "off",
    					spellcheck: false
    				}));

    				if (!isSearchable) {
    					$$invalidate(24, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*filterText, isMulti, selectedValue*/ 280 | $$self.$$.dirty[1] & /*items, loadOptions, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 253444 | $$self.$$.dirty[2] & /*originalItemsClone*/ 4) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.some(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(36, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(36, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		container,
    		input,
    		isFocused,
    		selectedValue,
    		filterText,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		handleClear,
    		activeSelectedValue,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		items,
    		listOpen,
    		list,
    		filteredItems,
    		Item$1,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		input_1_binding,
    		input_1_input_handler,
    		input_1_binding_1,
    		input_1_input_handler_1,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				container: 0,
    				input: 1,
    				Item: 37,
    				Selection: 6,
    				MultiSelection: 7,
    				isMulti: 8,
    				isDisabled: 9,
    				isCreatable: 38,
    				isFocused: 2,
    				selectedValue: 3,
    				filterText: 4,
    				placeholder: 39,
    				items: 33,
    				itemFilter: 40,
    				groupBy: 41,
    				groupFilter: 42,
    				isGroupHeaderSelectable: 43,
    				getGroupHeaderLabel: 44,
    				getOptionLabel: 45,
    				optionIdentifier: 46,
    				loadOptions: 47,
    				hasError: 10,
    				containerStyles: 11,
    				getSelectionLabel: 12,
    				createGroupHeaderItem: 48,
    				createItem: 49,
    				isSearchable: 13,
    				inputStyles: 14,
    				isClearable: 15,
    				isWaiting: 5,
    				listPlacement: 50,
    				listOpen: 34,
    				list: 35,
    				isVirtualList: 51,
    				loadOptionsInterval: 52,
    				noOptionsMessage: 53,
    				hideEmptyState: 54,
    				filteredItems: 36,
    				inputAttributes: 55,
    				listAutoWidth: 56,
    				itemHeight: 57,
    				Icon: 16,
    				iconProps: 17,
    				showChevron: 18,
    				showIndicator: 19,
    				containerClasses: 20,
    				indicatorSvg: 21,
    				handleClear: 22
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconProps() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconProps(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showChevron() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showChevron(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIndicator() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIndicator(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSvg() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSvg(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[22];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/admin/AddNew.svelte generated by Svelte v3.26.0 */
    const file$a = "src/pages/admin/AddNew.svelte";

    // (104:8) {#if categoryItems.length > 0}
    function create_if_block_3$2(ctx) {
    	let select;
    	let updating_selectedValue;
    	let current;

    	function select_selectedValue_binding(value) {
    		/*select_selectedValue_binding*/ ctx[11].call(null, value);
    	}

    	let select_props = {
    		items: /*categoryItems*/ ctx[6],
    		showIndicator: "true"
    	};

    	if (/*questionCategory*/ ctx[1] !== void 0) {
    		select_props.selectedValue = /*questionCategory*/ ctx[1];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(select.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*categoryItems*/ 64) select_changes.items = /*categoryItems*/ ctx[6];

    			if (!updating_selectedValue && dirty & /*questionCategory*/ 2) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*questionCategory*/ ctx[1];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(104:8) {#if categoryItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (108:8) {#if languageItems.length > 0}
    function create_if_block_2$2(ctx) {
    	let select;
    	let updating_selectedValue;
    	let current;

    	function select_selectedValue_binding_1(value) {
    		/*select_selectedValue_binding_1*/ ctx[12].call(null, value);
    	}

    	let select_props = {
    		items: /*languageItems*/ ctx[7],
    		showIndicator: "true"
    	};

    	if (/*questionLanguage*/ ctx[2] !== void 0) {
    		select_props.selectedValue = /*questionLanguage*/ ctx[2];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding_1));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(select.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*languageItems*/ 128) select_changes.items = /*languageItems*/ ctx[7];

    			if (!updating_selectedValue && dirty & /*questionLanguage*/ 4) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*questionLanguage*/ ctx[2];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(108:8) {#if languageItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (121:8) {#if categoryItems.length > 0}
    function create_if_block_1$3(ctx) {
    	let select;
    	let updating_selectedValue;
    	let current;

    	function select_selectedValue_binding_2(value) {
    		/*select_selectedValue_binding_2*/ ctx[15].call(null, value);
    	}

    	let select_props = {
    		items: /*categoryItems*/ ctx[6],
    		showIndicator: "true"
    	};

    	if (/*claimCategory*/ ctx[4] !== void 0) {
    		select_props.selectedValue = /*claimCategory*/ ctx[4];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding_2));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(select.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*categoryItems*/ 64) select_changes.items = /*categoryItems*/ ctx[6];

    			if (!updating_selectedValue && dirty & /*claimCategory*/ 16) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*claimCategory*/ ctx[4];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(121:8) {#if categoryItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (125:8) {#if languageItems.length > 0}
    function create_if_block$5(ctx) {
    	let select;
    	let updating_selectedValue;
    	let current;

    	function select_selectedValue_binding_3(value) {
    		/*select_selectedValue_binding_3*/ ctx[16].call(null, value);
    	}

    	let select_props = {
    		items: /*languageItems*/ ctx[7],
    		showIndicator: "true"
    	};

    	if (/*claimLanguage*/ ctx[5] !== void 0) {
    		select_props.selectedValue = /*claimLanguage*/ ctx[5];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding_3));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(select.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*languageItems*/ 128) select_changes.items = /*languageItems*/ ctx[7];

    			if (!updating_selectedValue && dirty & /*claimLanguage*/ 32) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*claimLanguage*/ ctx[5];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(125:8) {#if languageItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let div0;
    	let h20;
    	let t2_value = /*$languageStore*/ ctx[8].questiontitle + "";
    	let t2;
    	let t3;
    	let p0;
    	let t4_value = /*$languageStore*/ ctx[8].text + "";
    	let t4;
    	let t5;
    	let t6;
    	let textarea0;
    	let t7;
    	let p1;
    	let t8_value = /*$languageStore*/ ctx[8].category + "";
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let p2;
    	let t12_value = /*$languageStore*/ ctx[8].language + "";
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let br2;
    	let t16;
    	let button0;
    	let t17_value = /*$languageStore*/ ctx[8].addQuestion + "";
    	let t17;
    	let t18;
    	let div1;
    	let h21;
    	let t19_value = /*$languageStore*/ ctx[8].claimtitle + "";
    	let t19;
    	let t20;
    	let p3;
    	let t21_value = /*$languageStore*/ ctx[8].text + "";
    	let t21;
    	let t22;
    	let t23;
    	let textarea1;
    	let t24;
    	let p4;
    	let t25_value = /*$languageStore*/ ctx[8].category + "";
    	let t25;
    	let t26;
    	let t27;
    	let t28;
    	let p5;
    	let t29_value = /*$languageStore*/ ctx[8].language + "";
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let br3;
    	let t33;
    	let button1;
    	let t34_value = /*$languageStore*/ ctx[8].addClaim + "";
    	let t34;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*categoryItems*/ ctx[6].length > 0 && create_if_block_3$2(ctx);
    	let if_block1 = /*languageItems*/ ctx[7].length > 0 && create_if_block_2$2(ctx);
    	let if_block2 = /*categoryItems*/ ctx[6].length > 0 && create_if_block_1$3(ctx);
    	let if_block3 = /*languageItems*/ ctx[7].length > 0 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			div0 = element("div");
    			h20 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = text(":");
    			t6 = space();
    			textarea0 = element("textarea");
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = text(":");
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			p2 = element("p");
    			t12 = text(t12_value);
    			t13 = text(":");
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			br2 = element("br");
    			t16 = space();
    			button0 = element("button");
    			t17 = text(t17_value);
    			t18 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			t19 = text(t19_value);
    			t20 = space();
    			p3 = element("p");
    			t21 = text(t21_value);
    			t22 = text(":");
    			t23 = space();
    			textarea1 = element("textarea");
    			t24 = space();
    			p4 = element("p");
    			t25 = text(t25_value);
    			t26 = text(":");
    			t27 = space();
    			if (if_block2) if_block2.c();
    			t28 = space();
    			p5 = element("p");
    			t29 = text(t29_value);
    			t30 = text(":");
    			t31 = space();
    			if (if_block3) if_block3.c();
    			t32 = space();
    			br3 = element("br");
    			t33 = space();
    			button1 = element("button");
    			t34 = text(t34_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			br0 = claim_element(main_nodes, "BR", {});
    			t0 = claim_space(main_nodes);
    			br1 = claim_element(main_nodes, "BR", {});
    			t1 = claim_space(main_nodes);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h20 = claim_element(div0_nodes, "H2", {});
    			var h20_nodes = children(h20);
    			t2 = claim_text(h20_nodes, t2_value);
    			h20_nodes.forEach(detach_dev);
    			t3 = claim_space(div0_nodes);
    			p0 = claim_element(div0_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t4 = claim_text(p0_nodes, t4_value);
    			t5 = claim_text(p0_nodes, ":");
    			p0_nodes.forEach(detach_dev);
    			t6 = claim_space(div0_nodes);

    			textarea0 = claim_element(div0_nodes, "TEXTAREA", {
    				type: true,
    				class: true,
    				id: true,
    				name: true
    			});

    			children(textarea0).forEach(detach_dev);
    			t7 = claim_space(div0_nodes);
    			p1 = claim_element(div0_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t8 = claim_text(p1_nodes, t8_value);
    			t9 = claim_text(p1_nodes, ":");
    			p1_nodes.forEach(detach_dev);
    			t10 = claim_space(div0_nodes);
    			if (if_block0) if_block0.l(div0_nodes);
    			t11 = claim_space(div0_nodes);
    			p2 = claim_element(div0_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t12 = claim_text(p2_nodes, t12_value);
    			t13 = claim_text(p2_nodes, ":");
    			p2_nodes.forEach(detach_dev);
    			t14 = claim_space(div0_nodes);
    			if (if_block1) if_block1.l(div0_nodes);
    			t15 = claim_space(div0_nodes);
    			br2 = claim_element(div0_nodes, "BR", {});
    			t16 = claim_space(div0_nodes);
    			button0 = claim_element(div0_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t17 = claim_text(button0_nodes, t17_value);
    			button0_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t18 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h21 = claim_element(div1_nodes, "H2", {});
    			var h21_nodes = children(h21);
    			t19 = claim_text(h21_nodes, t19_value);
    			h21_nodes.forEach(detach_dev);
    			t20 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t21 = claim_text(p3_nodes, t21_value);
    			t22 = claim_text(p3_nodes, ":");
    			p3_nodes.forEach(detach_dev);
    			t23 = claim_space(div1_nodes);

    			textarea1 = claim_element(div1_nodes, "TEXTAREA", {
    				type: true,
    				class: true,
    				id: true,
    				name: true
    			});

    			children(textarea1).forEach(detach_dev);
    			t24 = claim_space(div1_nodes);
    			p4 = claim_element(div1_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			t25 = claim_text(p4_nodes, t25_value);
    			t26 = claim_text(p4_nodes, ":");
    			p4_nodes.forEach(detach_dev);
    			t27 = claim_space(div1_nodes);
    			if (if_block2) if_block2.l(div1_nodes);
    			t28 = claim_space(div1_nodes);
    			p5 = claim_element(div1_nodes, "P", { class: true });
    			var p5_nodes = children(p5);
    			t29 = claim_text(p5_nodes, t29_value);
    			t30 = claim_text(p5_nodes, ":");
    			p5_nodes.forEach(detach_dev);
    			t31 = claim_space(div1_nodes);
    			if (if_block3) if_block3.l(div1_nodes);
    			t32 = claim_space(div1_nodes);
    			br3 = claim_element(div1_nodes, "BR", {});
    			t33 = claim_space(div1_nodes);
    			button1 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t34 = claim_text(button1_nodes, t34_value);
    			button1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br0, file$a, 96, 4, 2789);
    			add_location(br1, file$a, 97, 4, 2800);
    			add_location(h20, file$a, 99, 8, 2846);
    			attr_dev(p0, "class", "svelte-x6npxz");
    			add_location(p0, file$a, 100, 8, 2894);
    			attr_dev(textarea0, "type", "text");
    			attr_dev(textarea0, "class", "textarea svelte-x6npxz");
    			attr_dev(textarea0, "id", "fname");
    			attr_dev(textarea0, "name", "fname");
    			add_location(textarea0, file$a, 101, 8, 2932);
    			attr_dev(p1, "class", "svelte-x6npxz");
    			add_location(p1, file$a, 102, 8, 3028);
    			attr_dev(p2, "class", "svelte-x6npxz");
    			add_location(p2, file$a, 106, 8, 3227);
    			add_location(br2, file$a, 110, 8, 3426);
    			attr_dev(button0, "class", "svelte-x6npxz");
    			add_location(button0, file$a, 112, 8, 3442);
    			attr_dev(div0, "class", "containerbox svelte-x6npxz");
    			add_location(div0, file$a, 98, 4, 2811);
    			add_location(h21, file$a, 116, 8, 3588);
    			attr_dev(p3, "class", "svelte-x6npxz");
    			add_location(p3, file$a, 117, 8, 3633);
    			attr_dev(textarea1, "type", "text");
    			attr_dev(textarea1, "class", "textarea svelte-x6npxz");
    			attr_dev(textarea1, "id", "fname");
    			attr_dev(textarea1, "name", "fname");
    			add_location(textarea1, file$a, 118, 8, 3671);
    			attr_dev(p4, "class", "svelte-x6npxz");
    			add_location(p4, file$a, 119, 8, 3764);
    			attr_dev(p5, "class", "svelte-x6npxz");
    			add_location(p5, file$a, 123, 8, 3960);
    			add_location(br3, file$a, 127, 8, 4156);
    			attr_dev(button1, "class", "svelte-x6npxz");
    			add_location(button1, file$a, 129, 8, 4172);
    			attr_dev(div1, "class", "containerbox svelte-x6npxz");
    			add_location(div1, file$a, 115, 4, 3553);
    			attr_dev(main, "class", "svelte-x6npxz");
    			add_location(main, file$a, 95, 0, 2778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, h20);
    			append_dev(h20, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, textarea0);
    			set_input_value(textarea0, /*question*/ ctx[0]);
    			append_dev(div0, t7);
    			append_dev(div0, p1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(div0, t10);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t11);
    			append_dev(div0, p2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(div0, t14);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t15);
    			append_dev(div0, br2);
    			append_dev(div0, t16);
    			append_dev(div0, button0);
    			append_dev(button0, t17);
    			append_dev(main, t18);
    			append_dev(main, div1);
    			append_dev(div1, h21);
    			append_dev(h21, t19);
    			append_dev(div1, t20);
    			append_dev(div1, p3);
    			append_dev(p3, t21);
    			append_dev(p3, t22);
    			append_dev(div1, t23);
    			append_dev(div1, textarea1);
    			set_input_value(textarea1, /*claim*/ ctx[3]);
    			append_dev(div1, t24);
    			append_dev(div1, p4);
    			append_dev(p4, t25);
    			append_dev(p4, t26);
    			append_dev(div1, t27);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t28);
    			append_dev(div1, p5);
    			append_dev(p5, t29);
    			append_dev(p5, t30);
    			append_dev(div1, t31);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div1, t32);
    			append_dev(div1, br3);
    			append_dev(div1, t33);
    			append_dev(div1, button1);
    			append_dev(button1, t34);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[10]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[14]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$languageStore*/ 256) && t2_value !== (t2_value = /*$languageStore*/ ctx[8].questiontitle + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$languageStore*/ 256) && t4_value !== (t4_value = /*$languageStore*/ ctx[8].text + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*question*/ 1) {
    				set_input_value(textarea0, /*question*/ ctx[0]);
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t8_value !== (t8_value = /*$languageStore*/ ctx[8].category + "")) set_data_dev(t8, t8_value);

    			if (/*categoryItems*/ ctx[6].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*categoryItems*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t11);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t12_value !== (t12_value = /*$languageStore*/ ctx[8].language + "")) set_data_dev(t12, t12_value);

    			if (/*languageItems*/ ctx[7].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*languageItems*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t15);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t17_value !== (t17_value = /*$languageStore*/ ctx[8].addQuestion + "")) set_data_dev(t17, t17_value);
    			if ((!current || dirty & /*$languageStore*/ 256) && t19_value !== (t19_value = /*$languageStore*/ ctx[8].claimtitle + "")) set_data_dev(t19, t19_value);
    			if ((!current || dirty & /*$languageStore*/ 256) && t21_value !== (t21_value = /*$languageStore*/ ctx[8].text + "")) set_data_dev(t21, t21_value);

    			if (dirty & /*claim*/ 8) {
    				set_input_value(textarea1, /*claim*/ ctx[3]);
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t25_value !== (t25_value = /*$languageStore*/ ctx[8].category + "")) set_data_dev(t25, t25_value);

    			if (/*categoryItems*/ ctx[6].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*categoryItems*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, t28);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t29_value !== (t29_value = /*$languageStore*/ ctx[8].language + "")) set_data_dev(t29, t29_value);

    			if (/*languageItems*/ ctx[7].length > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*languageItems*/ 128) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$5(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, t32);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t34_value !== (t34_value = /*$languageStore*/ ctx[8].addClaim + "")) set_data_dev(t34, t34_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(8, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddNew", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let question = "";
    	let questionCategory = undefined;
    	let questionLanguage = undefined;
    	let claim = "";
    	let claimCategory = undefined;
    	let claimLanguage = undefined;
    	let categoryItems = [];
    	let languageItems = [];

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		doGet(categoryUrl).then(c => c.map(i => $$invalidate(6, categoryItems = [...categoryItems, { value: i.id, label: i.name }])));
    		doGet(languageUrl).then(c => c.map(i => $$invalidate(7, languageItems = [...languageItems, { value: i.id, label: i.name }])));
    	}));

    	function reset(isQuestion) {
    		if (isQuestion) {
    			$$invalidate(0, question = "");
    			$$invalidate(2, questionLanguage = undefined);
    			$$invalidate(1, questionCategory = undefined);
    		} else {
    			$$invalidate(3, claim = "");
    			$$invalidate(5, claimLanguage = undefined);
    			$$invalidate(4, claimCategory = undefined);
    		}
    	}

    	function onPostedDone(url, isQuestion) {
    		doPost(url, {
    			text: isQuestion ? question : claim,
    			category: isQuestion
    			? questionCategory.value
    			: claimCategory.value,
    			language: isQuestion
    			? questionLanguage.value
    			: claimLanguage.value
    		});

    		reset(isQuestion);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddNew> was created with unknown prop '${key}'`);
    	});

    	function textarea0_input_handler() {
    		question = this.value;
    		$$invalidate(0, question);
    	}

    	function select_selectedValue_binding(value) {
    		questionCategory = value;
    		$$invalidate(1, questionCategory);
    	}

    	function select_selectedValue_binding_1(value) {
    		questionLanguage = value;
    		$$invalidate(2, questionLanguage);
    	}

    	const click_handler = () => onPostedDone(questionUrl, true);

    	function textarea1_input_handler() {
    		claim = this.value;
    		$$invalidate(3, claim);
    	}

    	function select_selectedValue_binding_2(value) {
    		claimCategory = value;
    		$$invalidate(4, claimCategory);
    	}

    	function select_selectedValue_binding_3(value) {
    		claimLanguage = value;
    		$$invalidate(5, claimLanguage);
    	}

    	const click_handler_1 = () => onPostedDone(claimUrl, false);

    	$$self.$capture_state = () => ({
    		__awaiter,
    		doPost,
    		questionUrl,
    		claimUrl,
    		doGet,
    		categoryUrl,
    		languageUrl,
    		onMount,
    		Select,
    		languageStore: counterStore,
    		question,
    		questionCategory,
    		questionLanguage,
    		claim,
    		claimCategory,
    		claimLanguage,
    		categoryItems,
    		languageItems,
    		reset,
    		onPostedDone,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    		if ("questionCategory" in $$props) $$invalidate(1, questionCategory = $$props.questionCategory);
    		if ("questionLanguage" in $$props) $$invalidate(2, questionLanguage = $$props.questionLanguage);
    		if ("claim" in $$props) $$invalidate(3, claim = $$props.claim);
    		if ("claimCategory" in $$props) $$invalidate(4, claimCategory = $$props.claimCategory);
    		if ("claimLanguage" in $$props) $$invalidate(5, claimLanguage = $$props.claimLanguage);
    		if ("categoryItems" in $$props) $$invalidate(6, categoryItems = $$props.categoryItems);
    		if ("languageItems" in $$props) $$invalidate(7, languageItems = $$props.languageItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		question,
    		questionCategory,
    		questionLanguage,
    		claim,
    		claimCategory,
    		claimLanguage,
    		categoryItems,
    		languageItems,
    		$languageStore,
    		onPostedDone,
    		textarea0_input_handler,
    		select_selectedValue_binding,
    		select_selectedValue_binding_1,
    		click_handler,
    		textarea1_input_handler,
    		select_selectedValue_binding_2,
    		select_selectedValue_binding_3,
    		click_handler_1
    	];
    }

    class AddNew extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddNew",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    function random(arrayLength) {
        return Math.floor(Math.random() * arrayLength);
    }

    /* src/pages/game/Game.svelte generated by Svelte v3.26.0 */
    const file$b = "src/pages/game/Game.svelte";

    // (110:8) {#if !gameEnded}
    function create_if_block_1$4(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = !/*gameStarted*/ ctx[0] && create_if_block_3$3(ctx);
    	let if_block1 = !!/*gameStarted*/ ctx[0] && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block0) if_block0.l(nodes);
    			t = claim_space(nodes);
    			if (if_block1) if_block1.l(nodes);
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*gameStarted*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!!/*gameStarted*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(110:8) {#if !gameEnded}",
    		ctx
    	});

    	return block;
    }

    // (111:12) {#if !gameStarted}
    function create_if_block_3$3(ctx) {
    	let button;
    	let t_value = /*$languageStore*/ ctx[4].startgame + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, t_value);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "svelte-179pou2");
    			add_location(button, file$b, 110, 30, 3238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setGameStarted*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 16 && t_value !== (t_value = /*$languageStore*/ ctx[4].startgame + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(111:12) {#if !gameStarted}",
    		ctx
    	});

    	return block;
    }

    // (112:12) {#if !!gameStarted}
    function create_if_block_2$3(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let t3;
    	let button;
    	let t4_value = /*$languageStore*/ ctx[4].next + "";
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*currentTitle*/ ctx[3]);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(/*currentText*/ ctx[2]);
    			t3 = space();
    			button = element("button");
    			t4 = text(t4_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, /*currentTitle*/ ctx[3]);
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h3 = claim_element(nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t2 = claim_text(h3_nodes, /*currentText*/ ctx[2]);
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t4 = claim_text(button_nodes, t4_value);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-179pou2");
    			add_location(h2, file$b, 112, 16, 3362);
    			attr_dev(h3, "class", "svelte-179pou2");
    			add_location(h3, file$b, 113, 16, 3402);
    			attr_dev(button, "class", "svelte-179pou2");
    			add_location(button, file$b, 114, 16, 3441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*getNext*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentTitle*/ 8) set_data_dev(t0, /*currentTitle*/ ctx[3]);
    			if (dirty & /*currentText*/ 4) set_data_dev(t2, /*currentText*/ ctx[2]);
    			if (dirty & /*$languageStore*/ 16 && t4_value !== (t4_value = /*$languageStore*/ ctx[4].next + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(112:12) {#if !!gameStarted}",
    		ctx
    	});

    	return block;
    }

    // (119:8) {#if gameEnded}
    function create_if_block$6(ctx) {
    	let h2;
    	let t0_value = /*$languageStore*/ ctx[4].gameover + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2_value = /*$languageStore*/ ctx[4].gameovermessage + "";
    	let t2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, t0_value);
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h3 = claim_element(nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t2 = claim_text(h3_nodes, t2_value);
    			h3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-179pou2");
    			add_location(h2, file$b, 119, 12, 3568);
    			attr_dev(h3, "class", "svelte-179pou2");
    			add_location(h3, file$b, 120, 12, 3615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 16 && t0_value !== (t0_value = /*$languageStore*/ ctx[4].gameover + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$languageStore*/ 16 && t2_value !== (t2_value = /*$languageStore*/ ctx[4].gameovermessage + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(119:8) {#if gameEnded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let div;
    	let t;
    	let if_block0 = !/*gameEnded*/ ctx[1] && create_if_block_1$4(ctx);
    	let if_block1 = /*gameEnded*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div = claim_element(main_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (if_block0) if_block0.l(div_nodes);
    			t = claim_space(div_nodes);
    			if (if_block1) if_block1.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "gamecontainer svelte-179pou2");
    			add_location(div, file$b, 108, 4, 3155);
    			attr_dev(main, "class", "svelte-179pou2");
    			add_location(main, file$b, 107, 0, 3144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*gameEnded*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*gameEnded*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(4, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let { questions = [] } = $$props;
    	let { claims = [] } = $$props;
    	let gameoptions = [];
    	let gameStarted = false;
    	let gameEnded = false;
    	let currentText = undefined;
    	let currentTitle = undefined;
    	let gamequestions = [];
    	let gameclaims = [];
    	let lengthRemaining = questions.length + claims.length;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		if (questions.length > 0) {
    			gameoptions.push("Q");
    			gamequestions = [...gamequestions, ...questions];
    		}

    		if (claims.length > 0) {
    			gameoptions.push("C");
    			gameclaims = claims;
    		}
    	}));

    	function getNext() {
    		if (lengthRemaining === 0) {
    			$$invalidate(1, gameEnded = true);
    			return;
    		}

    		let lol = gameoptions.length > 1
    		? gameoptions[random(gameoptions.length)]
    		: gameoptions[0];

    		if (lol === "Q") {
    			let qs = gamequestions[random(gamequestions.length)];
    			$$invalidate(2, currentText = qs.text);
    			$$invalidate(3, currentTitle = "Question");

    			if (gamequestions.length === 1) {
    				gameoptions = gameoptions.filter(i => i !== "Q");
    			}

    			gamequestions = gamequestions.filter(q => q.id !== qs.id);
    		} else if (lol === "C") {
    			let cl = gameclaims[random(gameclaims.length)];
    			$$invalidate(2, currentText = cl.text);
    			$$invalidate(3, currentTitle = "Claim");

    			if (gameclaims.length === 1) {
    				gameoptions = gameoptions.filter(i => i !== "C");
    			}

    			gameclaims = gameclaims.filter(c => c.id !== cl.id);
    		}

    		lengthRemaining = gamequestions.length + gameclaims.length;
    	}

    	function setGameStarted() {
    		$$invalidate(0, gameStarted = true);
    		getNext();
    	}

    	const writable_props = ["questions", "claims"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("questions" in $$props) $$invalidate(7, questions = $$props.questions);
    		if ("claims" in $$props) $$invalidate(8, claims = $$props.claims);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		random,
    		languageStore: counterStore,
    		questions,
    		claims,
    		gameoptions,
    		gameStarted,
    		gameEnded,
    		currentText,
    		currentTitle,
    		gamequestions,
    		gameclaims,
    		lengthRemaining,
    		getNext,
    		setGameStarted,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("questions" in $$props) $$invalidate(7, questions = $$props.questions);
    		if ("claims" in $$props) $$invalidate(8, claims = $$props.claims);
    		if ("gameoptions" in $$props) gameoptions = $$props.gameoptions;
    		if ("gameStarted" in $$props) $$invalidate(0, gameStarted = $$props.gameStarted);
    		if ("gameEnded" in $$props) $$invalidate(1, gameEnded = $$props.gameEnded);
    		if ("currentText" in $$props) $$invalidate(2, currentText = $$props.currentText);
    		if ("currentTitle" in $$props) $$invalidate(3, currentTitle = $$props.currentTitle);
    		if ("gamequestions" in $$props) gamequestions = $$props.gamequestions;
    		if ("gameclaims" in $$props) gameclaims = $$props.gameclaims;
    		if ("lengthRemaining" in $$props) lengthRemaining = $$props.lengthRemaining;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		gameStarted,
    		gameEnded,
    		currentText,
    		currentTitle,
    		$languageStore,
    		getNext,
    		setGameStarted,
    		questions,
    		claims
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { questions: 7, claims: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get questions() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set questions(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get claims() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set claims(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/game/GameSetupItem.svelte generated by Svelte v3.26.0 */
    const file$c = "src/pages/game/GameSetupItem.svelte";

    // (86:12) {#if categoryError}
    function create_if_block_1$5(ctx) {
    	let p;
    	let t_value = /*$languageStore*/ ctx[8].categoryerror + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, t_value);
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-1a5bmpq");
    			add_location(p, file$c, 86, 16, 1984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 256 && t_value !== (t_value = /*$languageStore*/ ctx[8].categoryerror + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(86:12) {#if categoryError}",
    		ctx
    	});

    	return block;
    }

    // (89:12) {#if languageError}
    function create_if_block$7(ctx) {
    	let p;
    	let t_value = /*$languageStore*/ ctx[8].languageerror + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, t_value);
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-1a5bmpq");
    			add_location(p, file$c, 89, 16, 2088);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 256 && t_value !== (t_value = /*$languageStore*/ ctx[8].languageerror + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(89:12) {#if languageError}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let div1;
    	let h3;
    	let t1;
    	let t2;
    	let select0;
    	let updating_selectedValue;
    	let t3;
    	let br1;
    	let t4;
    	let select1;
    	let updating_selectedValue_1;
    	let t5;
    	let br2;
    	let t6;
    	let div0;
    	let t7;
    	let t8;
    	let input;
    	let t9;
    	let button;
    	let t10_value = /*$languageStore*/ ctx[8].get + "";
    	let t10;
    	let t11;
    	let t12;
    	let current;
    	let mounted;
    	let dispose;

    	function select0_selectedValue_binding(value) {
    		/*select0_selectedValue_binding*/ ctx[12].call(null, value);
    	}

    	let select0_props = {
    		items: /*categoryItems*/ ctx[1],
    		showIndicator: "true",
    		placeholder: "Category"
    	};

    	if (/*selectedCategory*/ ctx[4] !== void 0) {
    		select0_props.selectedValue = /*selectedCategory*/ ctx[4];
    	}

    	select0 = new Select({ props: select0_props, $$inline: true });
    	binding_callbacks.push(() => bind(select0, "selectedValue", select0_selectedValue_binding));

    	function select1_selectedValue_binding(value) {
    		/*select1_selectedValue_binding*/ ctx[13].call(null, value);
    	}

    	let select1_props = {
    		items: /*languageItems*/ ctx[2],
    		showIndicator: "true",
    		placeholder: "Language"
    	};

    	if (/*selectedLanguage*/ ctx[5] !== void 0) {
    		select1_props.selectedValue = /*selectedLanguage*/ ctx[5];
    	}

    	select1 = new Select({ props: select1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select1, "selectedValue", select1_selectedValue_binding));
    	let if_block0 = /*categoryError*/ ctx[6] && create_if_block_1$5(ctx);
    	let if_block1 = /*languageError*/ ctx[7] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			create_component(select0.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			create_component(select1.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			input = element("input");
    			t9 = space();
    			button = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			t12 = text(/*title*/ ctx[0]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			br0 = claim_element(main_nodes, "BR", {});
    			t0 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t1 = claim_text(h3_nodes, /*title*/ ctx[0]);
    			h3_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			claim_component(select0.$$.fragment, div1_nodes);
    			t3 = claim_space(div1_nodes);
    			br1 = claim_element(div1_nodes, "BR", {});
    			t4 = claim_space(div1_nodes);
    			claim_component(select1.$$.fragment, div1_nodes);
    			t5 = claim_space(div1_nodes);
    			br2 = claim_element(div1_nodes, "BR", {});
    			t6 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (if_block0) if_block0.l(div0_nodes);
    			t7 = claim_space(div0_nodes);
    			if (if_block1) if_block1.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			input = claim_element(div1_nodes, "INPUT", { type: true, class: true, name: true });
    			t9 = claim_space(div1_nodes);
    			button = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t10 = claim_text(button_nodes, t10_value);
    			t11 = claim_space(button_nodes);
    			t12 = claim_text(button_nodes, /*title*/ ctx[0]);
    			button_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br0, file$c, 65, 4, 1468);
    			attr_dev(h3, "class", "svelte-1a5bmpq");
    			add_location(h3, file$c, 68, 8, 1516);
    			add_location(br1, file$c, 75, 8, 1713);
    			add_location(br2, file$c, 83, 8, 1901);
    			attr_dev(div0, "class", "error svelte-1a5bmpq");
    			add_location(div0, file$c, 84, 8, 1916);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "quantityquestion svelte-1a5bmpq");
    			attr_dev(input, "name", "fname");
    			add_location(input, file$c, 93, 8, 2168);
    			attr_dev(button, "class", "svelte-1a5bmpq");
    			add_location(button, file$c, 95, 8, 2261);
    			attr_dev(div1, "class", "progresssteps svelte-1a5bmpq");
    			add_location(div1, file$c, 67, 4, 1480);
    			add_location(main, file$c, 64, 0, 1457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			mount_component(select0, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, br1);
    			append_dev(div1, t4);
    			mount_component(select1, div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, br2);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t7);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t8);
    			append_dev(div1, input);
    			set_input_value(input, /*quantity*/ ctx[3]);
    			append_dev(div1, t9);
    			append_dev(div1, button);
    			append_dev(button, t10);
    			append_dev(button, t11);
    			append_dev(button, t12);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    					listen_dev(button, "click", /*getData*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);
    			const select0_changes = {};
    			if (dirty & /*categoryItems*/ 2) select0_changes.items = /*categoryItems*/ ctx[1];

    			if (!updating_selectedValue && dirty & /*selectedCategory*/ 16) {
    				updating_selectedValue = true;
    				select0_changes.selectedValue = /*selectedCategory*/ ctx[4];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select0.$set(select0_changes);
    			const select1_changes = {};
    			if (dirty & /*languageItems*/ 4) select1_changes.items = /*languageItems*/ ctx[2];

    			if (!updating_selectedValue_1 && dirty & /*selectedLanguage*/ 32) {
    				updating_selectedValue_1 = true;
    				select1_changes.selectedValue = /*selectedLanguage*/ ctx[5];
    				add_flush_callback(() => updating_selectedValue_1 = false);
    			}

    			select1.$set(select1_changes);

    			if (/*categoryError*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					if_block0.m(div0, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*languageError*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*quantity*/ 8 && to_number(input.value) !== /*quantity*/ ctx[3]) {
    				set_input_value(input, /*quantity*/ ctx[3]);
    			}

    			if ((!current || dirty & /*$languageStore*/ 256) && t10_value !== (t10_value = /*$languageStore*/ ctx[8].get + "")) set_data_dev(t10, t10_value);
    			if (!current || dirty & /*title*/ 1) set_data_dev(t12, /*title*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select0.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select0.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(select0);
    			destroy_component(select1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(8, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameSetupItem", slots, []);
    	
    	let { title = "" } = $$props;
    	let { url = "" } = $$props;
    	let { list = [] } = $$props;
    	let quantity = 10;
    	let { categoryItems = [] } = $$props;
    	let { languageItems = [] } = $$props;
    	let selectedCategory = undefined;
    	let selectedLanguage = undefined;
    	let categoryError = false;
    	let languageError = false;

    	function getData() {
    		if (!selectedCategory) $$invalidate(6, categoryError = true);

    		if (!selectedLanguage) $$invalidate(7, languageError = true); else if (quantity > 0 && selectedCategory && selectedLanguage) {
    			let params = arrayToParamstring([quantity, selectedLanguage.value, selectedCategory.value]);
    			doGetWithParams(url, params).then(qs => $$invalidate(10, list = qs));
    		}
    	}

    	const writable_props = ["title", "url", "list", "categoryItems", "languageItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameSetupItem> was created with unknown prop '${key}'`);
    	});

    	function select0_selectedValue_binding(value) {
    		selectedCategory = value;
    		$$invalidate(4, selectedCategory);
    	}

    	function select1_selectedValue_binding(value) {
    		selectedLanguage = value;
    		$$invalidate(5, selectedLanguage);
    	}

    	function input_input_handler() {
    		quantity = to_number(this.value);
    		$$invalidate(3, quantity);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    		if ("list" in $$props) $$invalidate(10, list = $$props.list);
    		if ("categoryItems" in $$props) $$invalidate(1, categoryItems = $$props.categoryItems);
    		if ("languageItems" in $$props) $$invalidate(2, languageItems = $$props.languageItems);
    	};

    	$$self.$capture_state = () => ({
    		arrayToParamstring,
    		doGetWithParams,
    		languageStore: counterStore,
    		Select,
    		title,
    		url,
    		list,
    		quantity,
    		categoryItems,
    		languageItems,
    		selectedCategory,
    		selectedLanguage,
    		categoryError,
    		languageError,
    		getData,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    		if ("list" in $$props) $$invalidate(10, list = $$props.list);
    		if ("quantity" in $$props) $$invalidate(3, quantity = $$props.quantity);
    		if ("categoryItems" in $$props) $$invalidate(1, categoryItems = $$props.categoryItems);
    		if ("languageItems" in $$props) $$invalidate(2, languageItems = $$props.languageItems);
    		if ("selectedCategory" in $$props) $$invalidate(4, selectedCategory = $$props.selectedCategory);
    		if ("selectedLanguage" in $$props) $$invalidate(5, selectedLanguage = $$props.selectedLanguage);
    		if ("categoryError" in $$props) $$invalidate(6, categoryError = $$props.categoryError);
    		if ("languageError" in $$props) $$invalidate(7, languageError = $$props.languageError);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		categoryItems,
    		languageItems,
    		quantity,
    		selectedCategory,
    		selectedLanguage,
    		categoryError,
    		languageError,
    		$languageStore,
    		getData,
    		list,
    		url,
    		select0_selectedValue_binding,
    		select1_selectedValue_binding,
    		input_input_handler
    	];
    }

    class GameSetupItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			title: 0,
    			url: 11,
    			list: 10,
    			categoryItems: 1,
    			languageItems: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameSetupItem",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get title() {
    		throw new Error("<GameSetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<GameSetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<GameSetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<GameSetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<GameSetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<GameSetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get categoryItems() {
    		throw new Error("<GameSetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set categoryItems(value) {
    		throw new Error("<GameSetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageItems() {
    		throw new Error("<GameSetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set languageItems(value) {
    		throw new Error("<GameSetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-material-icons/Check.svelte generated by Svelte v3.26.0 */

    const file$d = "node_modules/svelte-material-icons/Check.svelte";

    function create_fragment$f(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			svg = claim_element(nodes, "svg", { width: true, height: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true, fill: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "d", "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z");
    			attr_dev(path, "fill", /*color*/ ctx[2]);
    			add_location(path, file$d, 8, 59, 234);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			add_location(svg, file$d, 8, 0, 175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 4) {
    				attr_dev(path, "fill", /*color*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewBox*/ 8) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Check", slots, []);
    	let { size = "1em" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { color = "currentColor" } = $$props;
    	let { viewBox = "0 0 24 24" } = $$props;
    	const writable_props = ["size", "width", "height", "color", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Check> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	$$self.$capture_state = () => ({ size, width, height, color, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("viewBox" in $$props) $$invalidate(3, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height, color, viewBox, size];
    }

    class Check extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			size: 4,
    			width: 0,
    			height: 1,
    			color: 2,
    			viewBox: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Check",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get size() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<Check>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Check>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/game/GameSetupItemDone.svelte generated by Svelte v3.26.0 */
    const file$e = "src/pages/game/GameSetupItemDone.svelte";

    function create_fragment$g(ctx) {
    	let main;
    	let div;
    	let check;
    	let t0;
    	let p;
    	let t1_value = /*$languageStore*/ ctx[2].success + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5_value = /*$languageStore*/ ctx[2].successmessage + "";
    	let t5;
    	let current;

    	check = new Check({
    			props: {
    				size: /*size*/ ctx[4],
    				color: /*color*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(check.$$.fragment);
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = text(/*quantity*/ ctx[1]);
    			t3 = space();
    			t4 = text(/*itemType*/ ctx[0]);
    			t5 = text(t5_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			div = claim_element(main_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(check.$$.fragment, div_nodes);
    			t0 = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t1 = claim_text(p_nodes, t1_value);
    			t2 = claim_text(p_nodes, /*quantity*/ ctx[1]);
    			t3 = claim_space(p_nodes);
    			t4 = claim_text(p_nodes, /*itemType*/ ctx[0]);
    			t5 = claim_text(p_nodes, t5_value);
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-cte85d");
    			add_location(p, file$e, 19, 8, 408);
    			attr_dev(div, "class", "successcontainer");
    			add_location(div, file$e, 16, 4, 335);
    			add_location(main, file$e, 15, 0, 324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(check, div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$languageStore*/ 4) && t1_value !== (t1_value = /*$languageStore*/ ctx[2].success + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*quantity*/ 2) set_data_dev(t2, /*quantity*/ ctx[1]);
    			if (!current || dirty & /*itemType*/ 1) set_data_dev(t4, /*itemType*/ ctx[0]);
    			if ((!current || dirty & /*$languageStore*/ 4) && t5_value !== (t5_value = /*$languageStore*/ ctx[2].successmessage + "")) set_data_dev(t5, t5_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(check);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(2, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameSetupItemDone", slots, []);
    	let { itemType = "" } = $$props;
    	let { quantity = 10 } = $$props;
    	let color = "green";
    	let size = "3rem";
    	const writable_props = ["itemType", "quantity"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameSetupItemDone> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("itemType" in $$props) $$invalidate(0, itemType = $$props.itemType);
    		if ("quantity" in $$props) $$invalidate(1, quantity = $$props.quantity);
    	};

    	$$self.$capture_state = () => ({
    		Check,
    		languageStore: counterStore,
    		itemType,
    		quantity,
    		color,
    		size,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("itemType" in $$props) $$invalidate(0, itemType = $$props.itemType);
    		if ("quantity" in $$props) $$invalidate(1, quantity = $$props.quantity);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemType, quantity, $languageStore, color, size];
    }

    class GameSetupItemDone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { itemType: 0, quantity: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameSetupItemDone",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get itemType() {
    		throw new Error("<GameSetupItemDone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemType(value) {
    		throw new Error("<GameSetupItemDone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quantity() {
    		throw new Error("<GameSetupItemDone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quantity(value) {
    		throw new Error("<GameSetupItemDone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/game/newGame.svelte generated by Svelte v3.26.0 */
    const file$f = "src/pages/game/newGame.svelte";

    // (83:4) {#if !gameSetupDone}
    function create_if_block_1$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let button;
    	let t6_value = /*$languageStore*/ ctx[11].gameSetupDone + "";
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*questionAdded*/ ctx[9] && create_if_block_5$1(ctx);
    	let if_block1 = /*questionAdded*/ ctx[9] && create_if_block_4$1(ctx);
    	let if_block2 = !/*claimsAdded*/ ctx[10] && create_if_block_3$4(ctx);
    	let if_block3 = /*claimsAdded*/ ctx[10] && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			button = element("button");
    			t6 = text(t6_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			if (if_block0) if_block0.l(nodes);
    			t0 = claim_space(nodes);
    			if (if_block1) if_block1.l(nodes);
    			t1 = claim_space(nodes);
    			if (if_block2) if_block2.l(nodes);
    			t2 = claim_space(nodes);
    			if (if_block3) if_block3.l(nodes);
    			t3 = claim_space(nodes);
    			br0 = claim_element(nodes, "BR", {});
    			t4 = claim_space(nodes);
    			br1 = claim_element(nodes, "BR", {});
    			t5 = claim_space(nodes);
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t6 = claim_text(button_nodes, t6_value);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br0, file$f, 108, 8, 3403);
    			add_location(br1, file$f, 109, 8, 3418);
    			attr_dev(button, "class", "svelte-1e5ximz");
    			add_location(button, file$f, 110, 8, 3433);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t6);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setGameSetupDone*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*questionAdded*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*questionAdded*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*questionAdded*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*questionAdded*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!/*claimsAdded*/ ctx[10]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*claimsAdded*/ 1024) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*claimsAdded*/ ctx[10]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*claimsAdded*/ 1024) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2$4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$languageStore*/ 2048) && t6_value !== (t6_value = /*$languageStore*/ ctx[11].gameSetupDone + "")) set_data_dev(t6, t6_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(83:4) {#if !gameSetupDone}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if !questionAdded}
    function create_if_block_5$1(ctx) {
    	let gamesetupitem;
    	let updating_title;
    	let updating_url;
    	let updating_categoryItems;
    	let updating_languageItems;
    	let updating_list;
    	let current;

    	function gamesetupitem_title_binding(value) {
    		/*gamesetupitem_title_binding*/ ctx[13].call(null, value);
    	}

    	function gamesetupitem_url_binding(value) {
    		/*gamesetupitem_url_binding*/ ctx[14].call(null, value);
    	}

    	function gamesetupitem_categoryItems_binding(value) {
    		/*gamesetupitem_categoryItems_binding*/ ctx[15].call(null, value);
    	}

    	function gamesetupitem_languageItems_binding(value) {
    		/*gamesetupitem_languageItems_binding*/ ctx[16].call(null, value);
    	}

    	function gamesetupitem_list_binding(value) {
    		/*gamesetupitem_list_binding*/ ctx[17].call(null, value);
    	}

    	let gamesetupitem_props = {};

    	if (/*questionTitle*/ ctx[6] !== void 0) {
    		gamesetupitem_props.title = /*questionTitle*/ ctx[6];
    	}

    	if (/*questionUrl*/ ctx[4] !== void 0) {
    		gamesetupitem_props.url = /*questionUrl*/ ctx[4];
    	}

    	if (/*categoryItems*/ ctx[2] !== void 0) {
    		gamesetupitem_props.categoryItems = /*categoryItems*/ ctx[2];
    	}

    	if (/*languageItems*/ ctx[3] !== void 0) {
    		gamesetupitem_props.languageItems = /*languageItems*/ ctx[3];
    	}

    	if (/*questions*/ ctx[0] !== void 0) {
    		gamesetupitem_props.list = /*questions*/ ctx[0];
    	}

    	gamesetupitem = new GameSetupItem({
    			props: gamesetupitem_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gamesetupitem, "title", gamesetupitem_title_binding));
    	binding_callbacks.push(() => bind(gamesetupitem, "url", gamesetupitem_url_binding));
    	binding_callbacks.push(() => bind(gamesetupitem, "categoryItems", gamesetupitem_categoryItems_binding));
    	binding_callbacks.push(() => bind(gamesetupitem, "languageItems", gamesetupitem_languageItems_binding));
    	binding_callbacks.push(() => bind(gamesetupitem, "list", gamesetupitem_list_binding));

    	const block = {
    		c: function create() {
    			create_component(gamesetupitem.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(gamesetupitem.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamesetupitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamesetupitem_changes = {};

    			if (!updating_title && dirty & /*questionTitle*/ 64) {
    				updating_title = true;
    				gamesetupitem_changes.title = /*questionTitle*/ ctx[6];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_url && dirty & /*questionUrl*/ 16) {
    				updating_url = true;
    				gamesetupitem_changes.url = /*questionUrl*/ ctx[4];
    				add_flush_callback(() => updating_url = false);
    			}

    			if (!updating_categoryItems && dirty & /*categoryItems*/ 4) {
    				updating_categoryItems = true;
    				gamesetupitem_changes.categoryItems = /*categoryItems*/ ctx[2];
    				add_flush_callback(() => updating_categoryItems = false);
    			}

    			if (!updating_languageItems && dirty & /*languageItems*/ 8) {
    				updating_languageItems = true;
    				gamesetupitem_changes.languageItems = /*languageItems*/ ctx[3];
    				add_flush_callback(() => updating_languageItems = false);
    			}

    			if (!updating_list && dirty & /*questions*/ 1) {
    				updating_list = true;
    				gamesetupitem_changes.list = /*questions*/ ctx[0];
    				add_flush_callback(() => updating_list = false);
    			}

    			gamesetupitem.$set(gamesetupitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamesetupitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamesetupitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamesetupitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(84:8) {#if !questionAdded}",
    		ctx
    	});

    	return block;
    }

    // (92:8) {#if questionAdded}
    function create_if_block_4$1(ctx) {
    	let gamesetupitemdone;
    	let current;

    	gamesetupitemdone = new GameSetupItemDone({
    			props: {
    				itemType: /*questionTitle*/ ctx[6],
    				quantity: /*questions*/ ctx[0].length
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gamesetupitemdone.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(gamesetupitemdone.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamesetupitemdone, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamesetupitemdone_changes = {};
    			if (dirty & /*questionTitle*/ 64) gamesetupitemdone_changes.itemType = /*questionTitle*/ ctx[6];
    			if (dirty & /*questions*/ 1) gamesetupitemdone_changes.quantity = /*questions*/ ctx[0].length;
    			gamesetupitemdone.$set(gamesetupitemdone_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamesetupitemdone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamesetupitemdone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamesetupitemdone, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(92:8) {#if questionAdded}",
    		ctx
    	});

    	return block;
    }

    // (96:8) {#if !claimsAdded}
    function create_if_block_3$4(ctx) {
    	let gamesetupitem;
    	let updating_title;
    	let updating_url;
    	let updating_categoryItems;
    	let updating_languageItems;
    	let updating_list;
    	let current;

    	function gamesetupitem_title_binding_1(value) {
    		/*gamesetupitem_title_binding_1*/ ctx[18].call(null, value);
    	}

    	function gamesetupitem_url_binding_1(value) {
    		/*gamesetupitem_url_binding_1*/ ctx[19].call(null, value);
    	}

    	function gamesetupitem_categoryItems_binding_1(value) {
    		/*gamesetupitem_categoryItems_binding_1*/ ctx[20].call(null, value);
    	}

    	function gamesetupitem_languageItems_binding_1(value) {
    		/*gamesetupitem_languageItems_binding_1*/ ctx[21].call(null, value);
    	}

    	function gamesetupitem_list_binding_1(value) {
    		/*gamesetupitem_list_binding_1*/ ctx[22].call(null, value);
    	}

    	let gamesetupitem_props = {};

    	if (/*claimTitle*/ ctx[7] !== void 0) {
    		gamesetupitem_props.title = /*claimTitle*/ ctx[7];
    	}

    	if (/*claimurl*/ ctx[5] !== void 0) {
    		gamesetupitem_props.url = /*claimurl*/ ctx[5];
    	}

    	if (/*categoryItems*/ ctx[2] !== void 0) {
    		gamesetupitem_props.categoryItems = /*categoryItems*/ ctx[2];
    	}

    	if (/*languageItems*/ ctx[3] !== void 0) {
    		gamesetupitem_props.languageItems = /*languageItems*/ ctx[3];
    	}

    	if (/*claims*/ ctx[1] !== void 0) {
    		gamesetupitem_props.list = /*claims*/ ctx[1];
    	}

    	gamesetupitem = new GameSetupItem({
    			props: gamesetupitem_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gamesetupitem, "title", gamesetupitem_title_binding_1));
    	binding_callbacks.push(() => bind(gamesetupitem, "url", gamesetupitem_url_binding_1));
    	binding_callbacks.push(() => bind(gamesetupitem, "categoryItems", gamesetupitem_categoryItems_binding_1));
    	binding_callbacks.push(() => bind(gamesetupitem, "languageItems", gamesetupitem_languageItems_binding_1));
    	binding_callbacks.push(() => bind(gamesetupitem, "list", gamesetupitem_list_binding_1));

    	const block = {
    		c: function create() {
    			create_component(gamesetupitem.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(gamesetupitem.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamesetupitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamesetupitem_changes = {};

    			if (!updating_title && dirty & /*claimTitle*/ 128) {
    				updating_title = true;
    				gamesetupitem_changes.title = /*claimTitle*/ ctx[7];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_url && dirty & /*claimurl*/ 32) {
    				updating_url = true;
    				gamesetupitem_changes.url = /*claimurl*/ ctx[5];
    				add_flush_callback(() => updating_url = false);
    			}

    			if (!updating_categoryItems && dirty & /*categoryItems*/ 4) {
    				updating_categoryItems = true;
    				gamesetupitem_changes.categoryItems = /*categoryItems*/ ctx[2];
    				add_flush_callback(() => updating_categoryItems = false);
    			}

    			if (!updating_languageItems && dirty & /*languageItems*/ 8) {
    				updating_languageItems = true;
    				gamesetupitem_changes.languageItems = /*languageItems*/ ctx[3];
    				add_flush_callback(() => updating_languageItems = false);
    			}

    			if (!updating_list && dirty & /*claims*/ 2) {
    				updating_list = true;
    				gamesetupitem_changes.list = /*claims*/ ctx[1];
    				add_flush_callback(() => updating_list = false);
    			}

    			gamesetupitem.$set(gamesetupitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamesetupitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamesetupitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamesetupitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(96:8) {#if !claimsAdded}",
    		ctx
    	});

    	return block;
    }

    // (105:8) {#if claimsAdded}
    function create_if_block_2$4(ctx) {
    	let gamesetupitemdone;
    	let current;

    	gamesetupitemdone = new GameSetupItemDone({
    			props: {
    				itemType: /*claimTitle*/ ctx[7],
    				quantity: /*claims*/ ctx[1].length
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gamesetupitemdone.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(gamesetupitemdone.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamesetupitemdone, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamesetupitemdone_changes = {};
    			if (dirty & /*claimTitle*/ 128) gamesetupitemdone_changes.itemType = /*claimTitle*/ ctx[7];
    			if (dirty & /*claims*/ 2) gamesetupitemdone_changes.quantity = /*claims*/ ctx[1].length;
    			gamesetupitemdone.$set(gamesetupitemdone_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamesetupitemdone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamesetupitemdone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamesetupitemdone, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(105:8) {#if claimsAdded}",
    		ctx
    	});

    	return block;
    }

    // (113:4) {#if gameSetupDone}
    function create_if_block$8(ctx) {
    	let game;
    	let current;

    	game = new Game({
    			props: {
    				questions: /*questions*/ ctx[0],
    				claims: /*claims*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(game.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const game_changes = {};
    			if (dirty & /*questions*/ 1) game_changes.questions = /*questions*/ ctx[0];
    			if (dirty & /*claims*/ 2) game_changes.claims = /*claims*/ ctx[1];
    			game.$set(game_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(113:4) {#if gameSetupDone}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h3;
    	let t2_value = /*$languageStore*/ ctx[11].setUpNewGame + "";
    	let t2;
    	let t3;
    	let br2;
    	let t4;
    	let t5;
    	let current;
    	let if_block0 = !/*gameSetupDone*/ ctx[8] && create_if_block_1$6(ctx);
    	let if_block1 = /*gameSetupDone*/ ctx[8] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			t3 = space();
    			br2 = element("br");
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			br0 = claim_element(main_nodes, "BR", {});
    			t0 = claim_space(main_nodes);
    			br1 = claim_element(main_nodes, "BR", {});
    			t1 = claim_space(main_nodes);
    			h3 = claim_element(main_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t2 = claim_text(h3_nodes, t2_value);
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			br2 = claim_element(main_nodes, "BR", {});
    			t4 = claim_space(main_nodes);
    			if (if_block0) if_block0.l(main_nodes);
    			t5 = claim_space(main_nodes);
    			if (if_block1) if_block1.l(main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br0, file$f, 77, 4, 2529);
    			add_location(br1, file$f, 78, 4, 2540);
    			attr_dev(h3, "class", "svelte-1e5ximz");
    			add_location(h3, file$f, 79, 4, 2551);
    			add_location(br2, file$f, 81, 4, 2595);
    			attr_dev(main, "class", "svelte-1e5ximz");
    			add_location(main, file$f, 76, 0, 2518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, h3);
    			append_dev(h3, t2);
    			append_dev(main, t3);
    			append_dev(main, br2);
    			append_dev(main, t4);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t5);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$languageStore*/ 2048) && t2_value !== (t2_value = /*$languageStore*/ ctx[11].setUpNewGame + "")) set_data_dev(t2, t2_value);

    			if (!/*gameSetupDone*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*gameSetupDone*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t5);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*gameSetupDone*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*gameSetupDone*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(11, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NewGame", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	//TODO add validation
    	//remove add functionality when fetch is done
    	let questions = [];

    	let claims = [];
    	let categoryItems = [];
    	let languageItems = [];
    	let questionUrl = randomquestion;
    	let claimurl = randomclaim;
    	let questionTitle = $languageStore.question;
    	let claimTitle = $languageStore.claim;
    	let gameSetupDone = false;
    	let questionAdded = false;
    	let claimsAdded = false;

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		doGet(categoryUrl).then(c => c.map(i => $$invalidate(2, categoryItems = [...categoryItems, { value: i.id, label: i.name }])));
    		doGet(languageUrl).then(l => l.map(i => $$invalidate(3, languageItems = [...languageItems, { value: i.id, label: i.name }])));
    	}));

    	beforeUpdate(() => {
    		if (questions.length > 0) {
    			$$invalidate(9, questionAdded = true);
    		}

    		if (claims.length > 0) {
    			$$invalidate(10, claimsAdded = true);
    		}
    	});

    	function setGameSetupDone() {
    		// navigate('/game', { replace: true });
    		$$invalidate(8, gameSetupDone = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NewGame> was created with unknown prop '${key}'`);
    	});

    	function gamesetupitem_title_binding(value) {
    		questionTitle = value;
    		$$invalidate(6, questionTitle);
    	}

    	function gamesetupitem_url_binding(value) {
    		questionUrl = value;
    		$$invalidate(4, questionUrl);
    	}

    	function gamesetupitem_categoryItems_binding(value) {
    		categoryItems = value;
    		$$invalidate(2, categoryItems);
    	}

    	function gamesetupitem_languageItems_binding(value) {
    		languageItems = value;
    		$$invalidate(3, languageItems);
    	}

    	function gamesetupitem_list_binding(value) {
    		questions = value;
    		$$invalidate(0, questions);
    	}

    	function gamesetupitem_title_binding_1(value) {
    		claimTitle = value;
    		$$invalidate(7, claimTitle);
    	}

    	function gamesetupitem_url_binding_1(value) {
    		claimurl = value;
    		$$invalidate(5, claimurl);
    	}

    	function gamesetupitem_categoryItems_binding_1(value) {
    		categoryItems = value;
    		$$invalidate(2, categoryItems);
    	}

    	function gamesetupitem_languageItems_binding_1(value) {
    		languageItems = value;
    		$$invalidate(3, languageItems);
    	}

    	function gamesetupitem_list_binding_1(value) {
    		claims = value;
    		$$invalidate(1, claims);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		navigate,
    		languageStore: counterStore,
    		claimUrl,
    		doGet,
    		randomquestion,
    		randomclaim,
    		categoryUrl,
    		languageUrl,
    		onMount,
    		beforeUpdate,
    		Game,
    		GameSetupItem,
    		GameSetupItemDone,
    		questions,
    		claims,
    		categoryItems,
    		languageItems,
    		questionUrl,
    		claimurl,
    		questionTitle,
    		claimTitle,
    		gameSetupDone,
    		questionAdded,
    		claimsAdded,
    		setGameSetupDone,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    		if ("claims" in $$props) $$invalidate(1, claims = $$props.claims);
    		if ("categoryItems" in $$props) $$invalidate(2, categoryItems = $$props.categoryItems);
    		if ("languageItems" in $$props) $$invalidate(3, languageItems = $$props.languageItems);
    		if ("questionUrl" in $$props) $$invalidate(4, questionUrl = $$props.questionUrl);
    		if ("claimurl" in $$props) $$invalidate(5, claimurl = $$props.claimurl);
    		if ("questionTitle" in $$props) $$invalidate(6, questionTitle = $$props.questionTitle);
    		if ("claimTitle" in $$props) $$invalidate(7, claimTitle = $$props.claimTitle);
    		if ("gameSetupDone" in $$props) $$invalidate(8, gameSetupDone = $$props.gameSetupDone);
    		if ("questionAdded" in $$props) $$invalidate(9, questionAdded = $$props.questionAdded);
    		if ("claimsAdded" in $$props) $$invalidate(10, claimsAdded = $$props.claimsAdded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		questions,
    		claims,
    		categoryItems,
    		languageItems,
    		questionUrl,
    		claimurl,
    		questionTitle,
    		claimTitle,
    		gameSetupDone,
    		questionAdded,
    		claimsAdded,
    		$languageStore,
    		setGameSetupDone,
    		gamesetupitem_title_binding,
    		gamesetupitem_url_binding,
    		gamesetupitem_categoryItems_binding,
    		gamesetupitem_languageItems_binding,
    		gamesetupitem_list_binding,
    		gamesetupitem_title_binding_1,
    		gamesetupitem_url_binding_1,
    		gamesetupitem_categoryItems_binding_1,
    		gamesetupitem_languageItems_binding_1,
    		gamesetupitem_list_binding_1
    	];
    }

    class NewGame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewGame",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.26.0 */
    const file$g = "src/App.svelte";

    // (76:16) <Link to="/">
    function create_default_slot_6(ctx) {
    	let t_value = /*$languageStore*/ ctx[1].homeLink + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 2 && t_value !== (t_value = /*$languageStore*/ ctx[1].homeLink + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(76:16) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (77:16) <Link to="about">
    function create_default_slot_5(ctx) {
    	let t_value = /*$languageStore*/ ctx[1].aboutLink + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 2 && t_value !== (t_value = /*$languageStore*/ ctx[1].aboutLink + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(77:16) <Link to=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (78:16) <Link to="bottlespinn">
    function create_default_slot_4(ctx) {
    	let t_value = /*$languageStore*/ ctx[1].bottlespinnLink + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$languageStore*/ 2 && t_value !== (t_value = /*$languageStore*/ ctx[1].bottlespinnLink + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(78:16) <Link to=\\\"bottlespinn\\\">",
    		ctx
    	});

    	return block;
    }

    // (79:16) <Link to="addnew">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add new");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Add new");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(79:16) <Link to=\\\"addnew\\\">",
    		ctx
    	});

    	return block;
    }

    // (80:16) <Link to="newgame">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New game");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "New game");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(80:16) <Link to=\\\"newgame\\\">",
    		ctx
    	});

    	return block;
    }

    // (94:16) <Route path="/">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(home.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(94:16) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (74:8) <Router {url}>
    function create_default_slot$1(ctx) {
    	let nav;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let link4;
    	let t4;
    	let div;
    	let route0;
    	let t5;
    	let route1;
    	let t6;
    	let route2;
    	let t7;
    	let route3;
    	let t8;
    	let route4;
    	let t9;
    	let route5;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "about",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "bottlespinn",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				to: "addnew",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link4 = new Link({
    			props: {
    				to: "newgame",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route0 = new Route({
    			props: { path: "about", component: About },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "bottlespinn",
    				component: Bottlespinn
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "addnew", component: AddNew },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: { path: "newgame", component: NewGame },
    			$$inline: true
    		});

    	route4 = new Route({
    			props: { path: "game", component: Game },
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			create_component(link2.$$.fragment);
    			t2 = space();
    			create_component(link3.$$.fragment);
    			t3 = space();
    			create_component(link4.$$.fragment);
    			t4 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t5 = space();
    			create_component(route1.$$.fragment);
    			t6 = space();
    			create_component(route2.$$.fragment);
    			t7 = space();
    			create_component(route3.$$.fragment);
    			t8 = space();
    			create_component(route4.$$.fragment);
    			t9 = space();
    			create_component(route5.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			claim_component(link0.$$.fragment, nav_nodes);
    			t0 = claim_space(nav_nodes);
    			claim_component(link1.$$.fragment, nav_nodes);
    			t1 = claim_space(nav_nodes);
    			claim_component(link2.$$.fragment, nav_nodes);
    			t2 = claim_space(nav_nodes);
    			claim_component(link3.$$.fragment, nav_nodes);
    			t3 = claim_space(nav_nodes);
    			claim_component(link4.$$.fragment, nav_nodes);
    			nav_nodes.forEach(detach_dev);
    			t4 = claim_space(nodes);
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			claim_component(route0.$$.fragment, div_nodes);
    			t5 = claim_space(div_nodes);
    			claim_component(route1.$$.fragment, div_nodes);
    			t6 = claim_space(div_nodes);
    			claim_component(route2.$$.fragment, div_nodes);
    			t7 = claim_space(div_nodes);
    			claim_component(route3.$$.fragment, div_nodes);
    			t8 = claim_space(div_nodes);
    			claim_component(route4.$$.fragment, div_nodes);
    			t9 = claim_space(div_nodes);
    			claim_component(route5.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(nav, "class", "nav svelte-1nf7y88");
    			add_location(nav, file$g, 74, 12, 1729);
    			add_location(div, file$g, 82, 12, 2087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(link0, nav, null);
    			append_dev(nav, t0);
    			mount_component(link1, nav, null);
    			append_dev(nav, t1);
    			mount_component(link2, nav, null);
    			append_dev(nav, t2);
    			mount_component(link3, nav, null);
    			append_dev(nav, t3);
    			mount_component(link4, nav, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t5);
    			mount_component(route1, div, null);
    			append_dev(div, t6);
    			mount_component(route2, div, null);
    			append_dev(div, t7);
    			mount_component(route3, div, null);
    			append_dev(div, t8);
    			mount_component(route4, div, null);
    			append_dev(div, t9);
    			mount_component(route5, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope, $languageStore*/ 6) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope, $languageStore*/ 6) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope, $languageStore*/ 6) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(74:8) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let router;
    	let t1;
    	let div1;
    	let button0;
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			t2 = text("Norsk");
    			t3 = text("\n                                 |\n                 ");
    			button1 = element("button");
    			t4 = text("English");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			img = claim_element(div0_nodes, "IMG", {
    				class: true,
    				src: true,
    				height: true,
    				alt: true,
    				id: true
    			});

    			t0 = claim_space(div0_nodes);
    			claim_component(router.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			button0 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t2 = claim_text(button0_nodes, "Norsk");
    			button0_nodes.forEach(detach_dev);
    			t3 = claim_text(div1_nodes, "\n                                 |\n                 ");
    			button1 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t4 = claim_text(button1_nodes, "English");
    			button1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "class", "logoimg svelte-1nf7y88");
    			if (img.src !== (img_src_value = "tmpLogo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "100px");
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "id", "myLogo");
    			add_location(img, file$g, 72, 8, 1614);
    			attr_dev(div0, "class", "headercontainer");
    			add_location(div0, file$g, 71, 4, 1576);
    			attr_dev(button0, "class", "svelte-1nf7y88");
    			add_location(button0, file$g, 100, 32, 2792);
    			attr_dev(button1, "class", "svelte-1nf7y88");
    			add_location(button1, file$g, 102, 17, 2898);
    			attr_dev(div1, "class", "langcontainer svelte-1nf7y88");
    			add_location(div1, file$g, 99, 4, 2732);
    			attr_dev(main, "class", "svelte-1nf7y88");
    			add_location(main, file$g, 69, 0, 1564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			mount_component(router, div0, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(div1, button0);
    			append_dev(button0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(button1, t4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", counterStore.setNB, false, false, false),
    					listen_dev(button1, "click", counterStore.setEN, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope, $languageStore*/ 6) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $languageStore;
    	validate_store(counterStore, "languageStore");
    	component_subscribe($$self, counterStore, $$value => $$invalidate(1, $languageStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props; //This property is necessary declare to avoid ignore the Router
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Link,
    		onDestroy,
    		onMount,
    		Home,
    		About,
    		Bottlespinn,
    		AddNew,
    		NewGame,
    		Game,
    		languageStore: counterStore,
    		url,
    		$languageStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, $languageStore];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        hydrate: true,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
