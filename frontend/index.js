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
            tap(x => total += x),
            debounceTime(1000),
            map(x => Math.round(total))
        ).subscribe(RxJsVisualizer.observerForLine(1));
    }

    // #endregion

    // #region ------------------------------------------------------------------ moving average
    function btnMovingAverage() {

        Rx.fromEvent($("#userIdInput"), "change")
            .pipe(
                map(e => e.target.value),
                switchMap(id => {
                    return Rx.forkJoin(
                        Rx.from(fetch('https://jsonplaceholder.typicode.com/todos?userId=' + id).then(x => x.json()))
                            .pipe(
                                map(u => u.slice(0, 5)),
                            ),
                        Rx.from(fetch('https://jsonplaceholder.typicode.com/albums?userId=' + id).then(x => x.json()))
                            .pipe(
                                map(a => a.slice(0, 5)),
                            ),
                    );
                }),
            ).subscribe(([album, todo]) => {
                for (const albumElement of album.map(x => 'album ' + x.title)) {
                    RxJsVisualizer.writeToLine(albumElement)
                }
                for (const todoElement of todo.map(x => 'todo ' + x.title)) {
                    RxJsVisualizer.writeToLine(todoElement)
                }
            }
        )

    }

    // #endregion

    // #region ------------------------------------------------------------------ multiple clicks
    function btnMultipleClicks() {
        Rx.fromEvent($("#idInput"), "change")
            .pipe(
                map(e => e.target.value),
                flatMap(async id => {
                    let response = await fetch('https://jsonplaceholder.typicode.com/comments/' + id)
                    let comment = await response.json()

                    response = await fetch('https://jsonplaceholder.typicode.com/posts/' + comment.postId)
                    let post = await response.json()
                    response = await fetch('https://jsonplaceholder.typicode.com/users/' + post.userId)
                    let user = await response.json()

                    return user.username
                })
            )
            .subscribe(x => {
                document.querySelector("#nameOut").innerText = x;
            });
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
        const weightObs = Rx.fromEvent(document.querySelector("#weightInput"), "input");
        const heightObs = Rx.fromEvent(document.querySelector("#heightInput"), "input");
        const outSpan = document.querySelector("#bmiOut");

        Rx.combineLatest(weightObs, heightObs).subscribe(([$weight, $height]) => {
            const weight = $weight.target.value
            const height = $height.target.value

            outSpan.innerText = weight / (height * height)
        })
    }

    // #endregion

};