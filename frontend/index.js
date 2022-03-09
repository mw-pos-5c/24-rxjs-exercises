window.onload = () => {
    // #region RxJs imports
    const Rx = rxjs;
    const {
        Observable,
        Subject,
        ReplaySubject,
        BehaviorSubject,
    } = rxjs;
    const {
        buffer,
        bufferCount,
        bufferTime,
        combineLatest,
        concat,
        concatAll,
        connect,
        count,
        debounce,
        debounceTime,
        delay,
        distinct,
        distinctUntilChanged,
        filter,
        flatMap,
        forkJoin,
        map,
        mapTo,
        max,
        merge,
        min,
        pairwise,
        publish,
        reduce,
        refCount,
        scan,
        share,
        skip,
        startWith,
        switchMap,
        take,
        takeUntil,
        takeWhile,
        tap,
        throttle,
        throttleTime,
        withLatestFrom,
    } = rxjs.operators;
    const {
        DrawingSymbol
    } = RxJsVisualizer;
    const {
        draw
    } = RxJsVisualizer.operators;
    // #endregion

    // #region ------------------------------------------------------------------ RxJsVisualizer
    const symbols = {};
    symbols['[object MouseEvent]'] = new DrawingSymbol({
        imageUrl: 'images/flash.png'
    });
    RxJsVisualizer.init({
        canvasId: 'canvas',
        logDivId: 'logs',
        blockHeight: 50,
        shapeSize: 20,
        maxPeriod: 10000,
        tickPeriod: 1000,
        centerShapes: false,
        symbolMap: symbols,
        addNavigationButtons: true,
        DEBUG: false
    });
    RxJsVisualizer.useRandomSymbolsForNumbers(100);
    // #endregion

    // #region ------------------------------------------------------------------ register
    function registerClick(id, handler) {
        $(`#${id}`).on('click', ev => handler());
    }

    registerClick('btnMouseDistance', btnMouseDistance);
    registerClick('btnMovingAverage', btnMovingAverage);
    registerClick('btnMultipleClicks', btnMultipleClicks);
    registerClick('btnFixShare', btnFixShare);
    registerClick('btnWebSequentialList', btnWebSequentialList);
    // #endregion

    // #region ------------------------------------------------------------------ global observers
    const observer = {
        next: value => console.log(`next: ${value}`),
        error: error => console.error(error),
        complete: () => console.log('Completed')
    };

    // #endregion


    function distance(a, b) {
        const dx = Math.abs(a.clientX - b.clientX);
        const dy = Math.abs(a.clientY - b.clientY);

        return Math.sqrt(dx * dx + dy * dy);
    }

    // #region ------------------------------------------------------------------ mouse distance
    function btnMouseDistance() {
        console.log("start")
        RxJsVisualizer.prepareCanvas(['1', '2'])

        let total = 0;
        let event = Rx.fromEvent(document, "mousemove");
        event.pipe(
            throttleTime(500),
            pairwise(),
            map(x => distance(x[0], x[1])),
            tap(x => console.log(x)),
            tap(x => total+=x),
            debounceTime(1000),
            map(x => Math.round(total))
        ).subscribe(RxJsVisualizer.observerForLine(1));
    }

    // #endregion

    // #region ------------------------------------------------------------------ moving average
    function btnMovingAverage() {

    }

    // #endregion

    // #region ------------------------------------------------------------------ multiple clicks
    function btnMultipleClicks() {

    }

    // #endregion

    // #region ------------------------------------------------------------------ fix share
    function btnFixShare() {
        console.log('Fix this code so that a and b log the same events at the same time');
        const clock = Rx.interval(1000)
            .pipe(
                take(5),
                map(x => x + 1),
                share(),
                map(x => `${x} -> ${Math.random()}`),
            );
        clock.subscribe(x => console.log(`a: ${x}`));
        setTimeout(() => clock.subscribe(x => console.log(`b: ${x}`)), 2500);
    }

    // #endregion


    // #region ------------------------------------------------------------------ web sequential
    function btnWebSequentialList() {
        // https://jsonplaceholder.typicode.com/posts?userId=7 ==> postId 61-70
        // https://jsonplaceholder.typicode.com/comments?postId=61 ==> commentId 301-350
    }

    // #endregion

};