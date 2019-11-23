// const { createStore } = Redux;
import { createStore } from 'redux';
import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import ReactRouterDOM, { HashRouter, Link, Route, Switch } from 'react-router-dom'
import axios from 'axios';

// put the below at the top

const initialState = { // could just have it be an array
    employees: [],
    selected: 0,
    count: 0,
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case 'pageChange': 
            let newPage = {
                ...state,
                selected: action.data
            }
            return newPage;
        case 'newEmployees':
            let newEmployees = {
                ...state,
                employees: action.data
            }
        return newEmployees;
        case 'setCount': {
            let newState = {
                ...state,
                count: action.data,
            }
            return newState
        }
    default:
            return state
    }
}



// reducer for fetchEmployees where each employee is added to store individually
// const reducer = (state = initialState, action) => {
//     switch(action.type) {
//         case 'pageChange': 
//             let newPage = {
//                 ...state,
//                 selected: action.data
//             }
//             return newPage;
//         case 'newEmployees':
//             let newEmployees;
//             if (state.employees.length < 50) {
//                 newEmployees = {
//                     ...state,
//                     employees: [...state.employees, action.data],
//                 }
//             }
//             else {
//                 newEmployees = {
//                     ...state,
//                     employees: [action.data],
//                 }
//             }

//         return newEmployees;
//     default:
//             return state
//     }
// }


const store = createStore(reducer);

const fetchEmployees = async () => {
    const page = store.getState().selected;
    // console.log(page);
    await axios.get(`/api/employees/${page}`)
        .then(response => {
            const employees = response.data.rows;
            const count = response.data.count
            // console.log('axios employees: ', employees)
            store.dispatch( {
                type: 'newEmployees',
                data: employees,
            })
            store.dispatch({
                type: 'setCount',
                data: count,
            })
            // console.log('in the store: ', store.getState().employees)
        })
}

// with adding each employee to the store individually (requires if/else in switch above)
// const fetchEmployees = async () => {
//     const page = store.getState().selected;
//     console.log(page);
//     await axios.get(`/api/employees/${page}`)
//         .then(response => {
//             const employees = response.data.rows;
//             employees.forEach(employee => {
//                 store.dispatch( {
//                     type: 'newEmployees',
//                     data: {
//                         firstName: employee.firstName,
//                         lastName: employee.lastName,
//                         email: employee.email,
//                         title: employee.title,
//                     }
//                 })
//             })

//         })
// }


const rootEl = document.querySelector('#root');


class Nav extends Component {
    constructor(props) {
        super();
        this.state = store.getState()
    }
    componentWillUnmount() {
        this.unsubscribe();

    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState(store.getState()));
    }
    // componentDidMount() {
    //     const selected = Number(this.props.location.pathname.slice(1));
    //     this.setState({selected})
    // }
    // componentDidUpdate(prevProps) {
    //     const currentSpot = this.props.location.pathname;
    //     const priorSpot = prevProps.location.pathname;
    //     if (currentSpot !== priorSpot) {
    //         const selected = Number(currentSpot.slice(1));
    //         this.setState({selected})
    //     }

    // }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;
        // console.log('currentspot: ', currentSpot)
        // console.log('priorspot: ', priorSpot)
        if (currentSpot !== priorSpot) {
            const selected = Number(currentSpot.slice(1));
            // console.log('selected is:', selected);
            store.dispatch( {
                data: selected,
                type: 'pageChange'
            })
            // console.log('store selected is: ', store.getState().selected)
            // console.log('store employees are: ', store.getState().employees)
        }

    }
    // eslint-disable-next-line complexity
    render() {
        const selected = store.getState().selected;
        let numPages = Math.ceil(store.getState().count / 50)
        const linkMaker = Array(numPages).fill('');
        const path = this.props.location.pathname.slice(1)
        return (
            <div className='nav'>
                <a href={selected > 0 ? `#${selected - 1}` : '#'} >Previous</a>
                {/* <a href="#0" className={selected === 0 ? 'current': ''}>1</a>
                <a href="#1" className={selected === 1 ? 'current': ''}>2</a>
                <a href="#2" className={selected === 2 ? 'current': ''}>3</a>
                <a href="#3" className={selected === 3 ? 'current': ''}>4</a>
                <a href="#4" className={selected === 4 ? 'current': ''}>5</a>
                <a href="#5" className={selected === 5 ? 'current': ''}>6</a>
                <a href="#6" className={selected === 6 ? 'current': ''}>7</a> */}
                {
                    linkMaker.map((no, idx) => {
                        return <a
                            href={`#${idx}`}
                            className={selected === idx ? 'current' : ''}
                            >{idx + 1}</a>
                    })
                }
                <a
                    href={selected < 6 ? `#${selected + 1}` : '#6'}
                    >Next</a>
                <a href="#create" className={path === 'create' ? 'current' : ''}>Create Employee</a>
            </div>
        )
    }
}


// eslint-disable-next-line react/no-multi-comp
class List extends Component {
    constructor(props) { // might need props
        super();
        this.state = store.getState();
    }
    componentWillUnmount() {
        this.unsubscribe();

    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState(store.getState()))
    }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;
        if (currentSpot !== priorSpot) {
            fetchEmployees()
            // console.log('employees in the store: ', store.getState().employees)
        }
    }
    // componentDidUpdate(prevProps) {
    //     const currentSpot = this.props.location.pathname;
    //     const priorSpot = prevProps.location.pathname;

    //     if (currentSpot !== priorSpot) {
    //         const selected = currentSpot.slice(1)
    //         axios.get(`/api/employees/${Number(selected)}`) 
    //             .then(response => {
    //                 const employees = response.data.rows;
    //                 this.state.updateEmployees(employees);
    //                 this.setState({employees})
    //             })
    //     }

    // }
    deleteEmployee(e) {
        const id = e.target.parentNode.parentNode.dataset.id;
        axios.delete(`/api/employees/rows/${id}`)
        fetchEmployees();
    }
    render() {
        const { employees } = this.state;
        return (
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email </th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody className='employees'>
                    {
                        employees.map(employee => {
                            return (
                                <tr key={employee.id} data-id={employee.id}>
                                    <td>{employee.firstName}</td>
                                    <td>{employee.lastName}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.title}</td>
                                    <td><button onClick={(e) => this.deleteEmployee(e)}>Delete!</button></td>                                    
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }
}

// eslint-disable-next-line react/no-multi-comp
class Create extends Component {
    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            title: '',
        }
    }
    handleChange(ev) {
        const field = ev.target.name;
        this.setState({[field]: ev.target.value})
    }

    handleSubmit(e) {
        e.preventDefault();
        const { firstName, lastName, email, title } = this.state
        const newEmployee = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            title: title,
        }
        axios.post('/api/employees/', newEmployee);
        this.setState({
            firstName: '',
            lastName: '',
            email: '',
            title: '',
        })
        const inputs = [...document.querySelectorAll('input')]
        inputs.forEach(input => {
            input.value = ''
        });
    }

    render() {
        return (
            <form onSubmit={(e) => this.handleSubmit(e)}>
                <h3>Create New Employee</h3>
                <input type="text" name="firstName" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="lastName" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="email" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="title" onChange={(e) => this.handleChange(e)}/>
                <button>Create</button>
            </form>
        )
    }
}

// eslint-disable-next-line react/no-multi-comp
class App extends Component {
    componentDidMount() {
        fetchEmployees();
    }
    render() {
        return (
            <div className='header'>
            <h1>ACME Pager</h1>
            <HashRouter>
                <Route component = { Nav } />
                <Switch>
                    <Route path='/create' component = { Create } />
                    <Route path ='/:page?' component = { List } />
                </Switch>

            </HashRouter>
            </div>
        )
    }
}






// eslint-disable-next-line react/no-multi-comp
// class App extends Component {
//     constructor() {
//         super()
//         this.state = {
//             employees: [],
//             selected: 0,
//         }
//         this.updateEmployees = this.updateEmployees.bind(this);
//     }
//     // async componentDidMount() { // need something for the correct page, // might be response.data.rows
//     //     const { selected } = this.state // could also do this with location.hash or params?
//     //     await axios.get(`/api/employees/${Number(selected)}`) 
//     //         .then(response => {
//     //             const employees = response.data.rows;
//     //             // console.log('employees are: ', employees)
//     //             this.setState({employees})
//     //             // console.log(this.state.employees)
//     //         })
//     // }

//     updateEmployees(newEmployees) {
//         this.setState({employees: newEmployees})
//         console.log('app employees: ', this.state.employees)
//     }
//     render() {
//         const { employees, selected } = this.state;
//         const { updateEmployees } = this;
//         return (
//             <HashRouter>
//                 <Route render={(props) => <Nav employees={ employees } selected = { selected } {...props} />} />
//                 <Route path ='/:page?' render={(props) => <List employees={ employees } selected = { selected } updateEmployees = { updateEmployees } {...props} />} />
//             </HashRouter>
//         )
//     }
// }


ReactDOM.render(<App />, rootEl);
