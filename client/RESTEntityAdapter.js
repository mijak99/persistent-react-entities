
// import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
// CommonJS variant
var toolkit = require('@reduxjs/toolkit')
const { createSlice, createEntityAdapter, createAsyncThunk } = toolkit;

const adapter = createEntityAdapter({
    selectId: (entity) => entity.id,
    // sortComparer: (a, b) => a.id.localeCompare(b.id), // assumes id is a string
})

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}


function createFetchAllEntities(entityType) {
    const fetchAllEntities = createAsyncThunk(
        `${entityType}/fetchStatus`,
        async (unusedArg, { rejectWithValue }) => {
            console.log("FETCHING all", entityType)
            const response = await fetch(`/api/entity/type/${entityType}`, {
                method: "GET",
                headers
            });
            if (response.ok) {
                console.log("FETCHed all", entityType)
                return response.json();
            } else {
                return rejectWithValue(response.error)
            }
        }
    )
    return fetchAllEntities;
}

function createUpdateEntityAsync(entityType) {

    const updateEntityAsync = createAsyncThunk(
        `${entityType}/updateStatus`,
        async (entity, { rejectWithValue }) => {
            const response = await fetch(`/api/entity/${entity.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(entity, null, 2)
            });
            if (response.ok) {
                const data = response.json();
                console.log("the response data was", data)
                return data;
            } else {
                console.log("error response", response)
                return rejectWithValue(response.error)
            }
        }
    );
    return updateEntityAsync;
}

function createCreateEntityAsync(entityType) {

    const createEntityAsync = createAsyncThunk(
        `${entityType}/createStatus`,
        async (entity, { rejectWithValue }) => {
            const response = await fetch(`/api/entity/${entityType}`, {
                method: "POST",
                headers,
                body: JSON.stringify(entity, null, 2)
            });
            if (response.ok) {
                const data = response.json();
                console.log("the response data was", data)
                return data;
            } else {
                console.log("error response", response)
                return rejectWithValue(response.error)
            }
        }
    )
    return createEntityAsync;
}

function createRemoveEntityAsync(entityType) {

    const removeEntityAsync = createAsyncThunk(
        `${entityType}/deleteStatus`,
        async (entity, { rejectWithValue }) => {
            const response = await fetch(`/api/entity/${entity.id}`, {
                method: "DELETE",
                headers,
            });
            if (response.ok) {
                const data = response.json();
                console.log("the response data was", data)
                return data;
            } else {
                console.log("error response", response)
                return rejectWithValue(response.error)
            }
        }
    );
    return removeEntityAsync;
}


function createEntitySlice(actions) {

    const entitySlice = createSlice({
        name: 'entity',
        initialState: adapter.getInitialState(),
        reducers: {
            create(state, action) {
                // console.log("adding one")
                adapter.addOne(state, action.payload)
            },
            update(state, action) {
                // console.log("updating one")
                adapter.updateOne(state, { id: action.payload.id, changes: action.payload });
            },
            upsert(state, action) {
                // console.log("updserting one")
                adapter.upsertOne(state, action.payload)
            },
            remove: adapter.removeOne,
            setAll: adapter.setAll,
        },

        extraReducers: {
            // Add reducers for additional action types here, and handle loading state as needed
            [actions.updateEntityAsync.fulfilled]: (state, action) => {
                // console.log("UDPATE ENTITY FULFILLED", action, state)
                adapter.updateOne(state, { id: action.payload.id, changes: action.payload });
                // console.log("UDPATE ENTITY FULFILLED after", action, state)
            },
            [actions.updateEntityAsync.rejected]: (state, action) => {
                console.log("UDPATE ENTITY REJECTED", action)
            },
            [actions.updateEntityAsync.pending]: (state, action) => {
                // console.log("UDPATE ENTITY PENDING", action)
            },
            [actions.createEntityAsync.fulfilled]: (state, action) => {
                // console.log("CREATE ENTITY FULFILLED", action, state)
                adapter.addOne(state, action.payload);
            },
            [actions.createEntityAsync.rejected]: (state, action) => {
                console.log("CREATE ENTITY REJECTED", action)
            },
            [actions.createEntityAsync.pending]: (state, action) => {
                // console.log("CREATE ENTITY PENDING", action)
            },
            [actions.removeEntityAsync.fulfilled]: (state, action) => {
                // console.log("REMOVE ENTITY FULFILLED", action)
                adapter.removeOne(state, action.payload);
            },
            [actions.removeEntityAsync.rejected]: (state, action) => {
                console.log("REMOVE ENTITY REJECTED", action)
            },
            [actions.removeEntityAsync.pending]: (state, action) => {
                // console.log("REMOVE ENTITY PENDING", action)
            },
            [actions.fetchAllEntities.fulfilled]: (state, action) => {
                // console.log("FETCH ALL FULFILLED", action)
                adapter.setAll(state, action.payload);
            },
            [actions.fetchAllEntities.rejected]: (state, action) => {
                console.log("FETCH ALL REJECTED", action)
            },
            [actions.fetchAllEntities.pending]: (state, action) => {
                // console.log("FETCH ALL PENDING", action)
            },

        }
    });
    return entitySlice;
}


/**
 * 
 */

class RESTEntityAdapter {
    /**
     * 
     * @param {*} type 
     * @param {*} options selectId (@see options in createEntityAdapter)
     */
    constructor(type, options={} ) {
        this.type = type;
        this.adapter = createEntityAdapter(options);
        this.actions = {
            createEntityAsync: createCreateEntityAsync(this.type),
            updateEntityAsync: createUpdateEntityAsync(this.type),
            removeEntityAsync: createRemoveEntityAsync(this.type),
            fetchAllEntities: createFetchAllEntities(this.type),
        };
        this.slice = createEntitySlice(this.actions);
    }

    get reducer() {
        return this.slice.reducer;
    }

    get selectors() {
        return this.adapter.getSelectors();
    }


}

exports.RESTEntityAdapter = RESTEntityAdapter;