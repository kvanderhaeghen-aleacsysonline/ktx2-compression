import { Game, IGame } from './game';

type WindowExt = Window &
    typeof globalThis & {
        TestGame: GameExports;
    };

interface GameExports {
    launch: (idToChange: string, config: unknown) => Promise<void>;
    reload: () => Promise<void>;
}

export default ((): GameExports => {
    const inClosure: IGame = new Game();
    const pageReturn: GameExports = {
        launch: inClosure.launch.bind(inClosure),
        reload: inClosure.reload.bind(inClosure),
    };
    if (typeof window !== undefined) {
        (window as WindowExt)['TestGame'] = pageReturn;
    }
    return pageReturn;
})();
