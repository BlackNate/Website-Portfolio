import subprocess,glob,sys,os
d=sys.argv[1]; fs=sorted(glob.glob(os.path.join(d,'f_*.jpg')))
for k in range(0,len(fs),9):
    grp=fs[k:k+9]; args=[]
    for f in grp: args+=['-i',f]
    filt=''.join(f'[{i}:v]scale=640:360[v{i}];' for i in range(len(grp)))
    filt+=''.join(f'[v{i}]' for i in range(len(grp)))+f'xstack=inputs={len(grp)}:layout='+'|'.join(f'{(i%3)*640}_{(i//3)*360}' for i in range(len(grp)))+':fill=black'
    if len(grp)==1: filt=f'[0:v]scale=640:360'
    subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',filt,os.path.join(d,f'sheet_{k//9:02d}.png')])
print(len(fs))
