import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControlLabel, Checkbox } from '@mui/material';

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ open, onClose }) => {
  const [hideForWeek, setHideForWeek] = useState(false);

  const handleClose = () => {
    if (hideForWeek) {
      const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('hide_intro_modal_until', expiry.toString());
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>머먹지 소개</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          <strong>머먹지</strong>는 맛집을 탐색하고 방문 일정을 관리할 수 있는 서비스입니다.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • 카카오맵을 활용하여 내 주변 및 원하는 지역의 맛집을 검색할 수 있습니다.<br />
          • 구글 계정으로 로그인하고 북마크와 방문 일정을 캘린더에 연동해보세요.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '8px 24px' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hideForWeek}
              onChange={(e) => setHideForWeek(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">일주일 동안 이 창 보지 않기</Typography>}
        />
        <Button
          onClick={handleClose}
          variant="contained"
          disableElevation
          sx={{
            backgroundColor: 'rgb(132, 94, 194)',
            '&:hover': {
              backgroundColor: 'rgb(102, 64, 164)'
            }
          }}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IntroModal;
