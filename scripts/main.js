let canvas=document.getElementById("screen")
let screen=canvas.getContext("2d")

let empty_color="rgb(160,160,160)"
let p1_color="rgb(100,200,200)"
let p2_color="rgb(200,100,200)"
let highlight_color="rgb(200,200,200)"

let cell_size=40
let map=[]
let next_state=[-1,-1]
let state_captured=[[0,0,0],[0,0,0],[0,0,0]]
let player=1

let a,b,c,d
for(a=0;a<3;a++){
	map[a]=[]
	for(b=0;b<3;b++){
		map[a][b]=[]
		for(c=0;c<3;c++){
			map[a][b][c]=[]
			for(d=0;d<3;d++){
				map[a][b][c][d]=0
			}
		}
	}
}

function draw_map(mouse_pos){
	for(a=0;a<3;a++){
		for(b=0;b<3;b++){
			if(state_captured[a][b]!=0){
				if(state_captured[a][b]==1){screen.fillStyle=p1_color}
				if(state_captured[a][b]==-1){screen.fillStyle=p2_color}
				screen.fillRect(b*125+1,a*125+1,119,119)
				continue
			}
			for(c=0;c<3;c++){
				for(d=0;d<3;d++){
					if(map[a][b][c][d]==0){
						if(next_state[0]==-1 || (next_state[0]==a && next_state[1]==b)){
							if(d*40+b*125+1<mouse_pos[0] && mouse_pos[0]<d*40+b*125+41 && c*40+a*125+1<mouse_pos[1] && mouse_pos[1]<c*40+a*125+41){
								screen.fillStyle=empty_color
							}
							else{screen.fillStyle=highlight_color}
						}
						else{screen.fillStyle=empty_color}
					}
					if(map[a][b][c][d]==1){screen.fillStyle=p1_color}
					if(map[a][b][c][d]==-1){screen.fillStyle=p2_color}
					screen.fillRect(d*40+b*125+1,c*40+a*125+1,38,38)
				}
			}
		}
	}
}

function simulate(i,j,k,l,player){
	let moves=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]]
	let x
	let ck,cl
	for(x=0;x<8;x++){
		ck=k+moves[x][0]
		cl=l+moves[x][1]
		if(0<=ck && ck<3 && 0<=cl && cl<3){
			if(map[i][j][ck][cl]==player){
				ck=ck+moves[x][0]
				cl=cl+moves[x][1]
				if(0<=ck && ck<3 && 0<=cl && cl<3){
					if(map[i][j][ck][cl]==player){
						return 1
					}
					else{continue}
				}
				else{
					ck=k-moves[x][0]
					cl=l-moves[x][1]
					if(0<=ck && ck<3 && 0<=cl && cl<3){
						if(map[i][j][ck][cl]==player){
							return 1
						}
						else{continue}
					}
					else{continue}
				}
			}
			else{continue}
		}
		else{continue}
	}
	return 0
}

function mousemove(event){
	let mouse_pos=[event.offsetX,event.offsetY]
	draw_map(mouse_pos)
}

function mouseclick(event){
	let mouse_pos=[event.offsetX,event.offsetY]
	let i,j,k,l
	for(i=0;i<3;i++){
		for(j=0;j<3;j++){
			for(k=0;k<3;k++){
				for(l=0;l<3;l++){
					if(l*40+j*125+1<mouse_pos[0] && mouse_pos[0]<l*40+j*125+41 && k*40+i*125+1<mouse_pos[1] && mouse_pos[1]<k*40+i*125+41){
						if(next_state[0]==-1 || (next_state[0]==i && next_state[1]==j)){
							if(map[i][j][k][l]==0){

								map[i][j][k][l]=player
								if(simulate(i,j,k,l,player)){state_captured[i][j]=player}
								player=-player
								if(state_captured[k][l]!=0){
									next_state[0]=-1
									next_state[1]=-1
								}
								else{
									next_state[0]=k
									next_state[1]=l
								}
							}
						}
						draw_map(mouse_pos)
						return
					}
				}
			}
		}
	}
}

draw_map([-1,-1])
canvas.addEventListener('mousemove',function(event){mousemove(event)})
canvas.addEventListener('mousedown',function(event){mouseclick(event)})