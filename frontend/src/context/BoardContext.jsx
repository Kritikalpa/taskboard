import { createContext, useContext, useReducer } from 'react';
import { arrayMove } from '../utils/reorder';

const BoardContext = createContext(null);

const initialState = {
  board: null,
  lists: [],
  loading: true,
  error: null,
};

function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_BOARD': {
      const { lists, ...board } = action.payload;
      return {
        ...state,
        board,
        lists: lists || [],
        loading: false,
        error: null,
      };
    }

    case 'ADD_LIST':
      return {
        ...state,
        lists: [...state.lists, { ...action.payload, cards: [] }],
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(l => l.id !== action.payload),
      };

    case 'UPDATE_LIST': {
      const { id, ...fields } = action.payload;
      return {
        ...state,
        lists: state.lists.map(l => l.id === id ? { ...l, ...fields } : l),
      };
    }

    case 'ADD_CARD': {
      const { listId, card } = action.payload;
      return {
        ...state,
        lists: state.lists.map(l => {
          if (l.id !== listId) return l;
          const cards = [...l.cards];
          const pos = card.position ?? cards.length;
          cards.splice(pos, 0, card);
          return { ...l, cards };
        }),
      };
    }

    case 'DELETE_CARD': {
      const cardId = action.payload;
      return {
        ...state,
        lists: state.lists.map(l => ({
          ...l,
          cards: l.cards.filter(c => c.id !== cardId),
        })),
      };
    }

    case 'UPDATE_CARD': {
      const { id, ...fields } = action.payload;
      return {
        ...state,
        lists: state.lists.map(l => ({
          ...l,
          cards: l.cards.map(c => c.id === id ? { ...c, ...fields } : c),
        })),
      };
    }

    case 'MOVE_CARD': {
      const { cardId, fromListId, toListId, newIndex } = action.payload;
      let movedCard = null;

      // remove from source
      const afterRemove = state.lists.map(l => {
        if (l.id !== fromListId) return l;
        const idx = l.cards.findIndex(c => c.id === cardId);
        if (idx === -1) return l;
        movedCard = l.cards[idx];
        return { ...l, cards: l.cards.filter(c => c.id !== cardId) };
      });

      // insert into destination
      return {
        ...state,
        lists: afterRemove.map(l => {
          if (l.id !== toListId) return l;
          const updated = [...l.cards];
          updated.splice(newIndex, 0, { ...movedCard, board_list_id: toListId });
          return { ...l, cards: updated };
        }),
      };
    }

    case 'REORDER_CARDS': {
      const { listId, fromIndex, toIndex } = action.payload;
      return {
        ...state,
        lists: state.lists.map(l =>
          l.id === listId
            ? { ...l, cards: arrayMove(l.cards, fromIndex, toIndex) }
            : l
        ),
      };
    }

    case 'ADD_MEMBER': {
      const member = action.payload;
      if (!member) return state;
      return {
        ...state,
        board: {
          ...state.board,
          members: (state.board.members || []).some(m => m.id === member.id)
            ? state.board.members
            : [...(state.board.members || []), member],
        },
      };
    }

    case 'REMOVE_MEMBER': {
      const userId = action.payload;
      if (userId == null) return state;
      return {
        ...state,
        board: {
          ...state.board,
          members: (state.board.members || []).filter(m => m.id !== userId),
        },
        lists: state.lists.map(l => ({
          ...l,
          cards: l.cards.map(c => ({
            ...c,
            assignees: (c.assignees || []).filter(a => a.id !== userId),
          })),
        })),
      };
    }

    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used within BoardProvider');
  return ctx;
}
